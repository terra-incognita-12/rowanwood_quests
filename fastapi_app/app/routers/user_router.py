import time
from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from sqlalchemy import asc
from typing import List
from pydantic import EmailStr

from ..send_email.email import Email
from ..database import get_db
from ..s3 import s3
from ..config import settings
from ..models import User
from ..schemes import user_scheme
from ..oauth2 import require_user
from ..hasher import Hasher
from ..email_token import EmailToken

router = APIRouter()

FOLDER = 'user/'

# ALL USERS

# CHANGE USERNAME

@router.patch('/change_username')
def change_username(payload: user_scheme.ChangeUsernameScheme, db: Session = Depends(get_db), user_id: str = Depends(require_user)):
	user_query = db.query(User).filter(User.id == user_id)
	check_user = user_query.first()

	check_username = db.query(User).filter(User.username == payload.username).first()

	if not check_user:
		raise HTTPException(status_code=404, detail="User doesn't exist")

	if not Hasher.verify_password(payload.password, check_user.password):
		raise HTTPException(status_code=403, detail="Wrong password")

	if check_username:
		raise HTTPException(status_code=403, detail='User with this username already exists')

	user_query.update({'username': payload.username}, synchronize_session=False)
	db.commit()

	return {'success': 'OK'}

# CHANGE EMAIL

@router.patch('/change_email')
async def change_email(payload: user_scheme.ChangeEmailScheme, request: Request, db: Session = Depends(get_db), user_id: str = Depends(require_user)):
	check_user = db.query(User).filter(User.id == user_id).first()
	check_email = db.query(User).filter(User.email == EmailStr(payload.email.lower())).first()

	if not check_user:
		raise HTTPException(status_code=404, detail="User doesn't exist")

	if not Hasher.verify_password(payload.password, check_user.password):
		raise HTTPException(status_code=403, detail="Wrong password")

	if check_email:
		raise HTTPException(status_code=403, detail='User with this email already exists')

	token = EmailToken.get_change_email_token(check_user.email, payload.email, settings.EMAIL_TOKEN_EXPIRES_SECONDS)
	try:
		url = f"{request.url.scheme}://{request.client.host}:{request.url.port}/user/verify_change_email/{token}"
		await Email(check_user, url, [payload.email]).send_verification_change_email_link()
		
		return {'status': 'success', 'message': 'Change email link was sent to your new email'}

	except Exception as error:
		print(error)
		raise HTTPException(status_code=500, detail='There was an error sending email')

# VERIFY EMAIL ADDRESS TO CHANGE EMAIL

@router.get('/verify_change_email/{token}', response_class=RedirectResponse, status_code=302)
def email_verification(token: str, request: Request, db: Session = Depends(get_db)):
	token_decode = EmailToken.decode_change_email_token(token)
	old_email = token_decode[0]
	new_email = token_decode[1]
	expire_time = token_decode[2]
	if time.time() > expire_time:
		raise HTTPException(status_code=401, detail='Link is expired')

	user_query = db.query(User).filter(User.email == EmailStr(old_email.lower()))
	check_user = user_query.first()
	if not check_user:
		raise HTTPException(status_code=404, detail="Invalid token or user doesn't exist")

	user_query.update({'email': new_email}, synchronize_session=False)
	db.commit()

	return f"{settings.SITE_ADDRESS}/profile"

# CHANGE PASSWORD WITN NO TOKEN

@router.patch('/change_password_notoken')
def change_password_notoken(payload: user_scheme.ChangePasswordWithoutTokenUserScheme, db: Session = Depends(get_db), user_id: str = Depends(require_user)):
	user_query = db.query(User).filter(User.id == user_id)
	check_user = user_query.first()

	if not check_user:
		raise HTTPException(status_code=404, detail="User doesn't exist")

	if not Hasher.verify_password(payload.old_password, check_user.password):
		raise HTTPException(status_code=403, detail="Wrong password")

	if payload.new_password != payload.new_password_confirm:
		raise HTTPException(status_code=403, detail='Passwords do not match')

	payload.new_password = Hasher.get_password_hash(payload.new_password)

	user_query.update({'password': payload.new_password}, synchronize_session=False)
	db.commit()

	return {'status': 'OK'}

# S3

@router.patch('/update_photo')
def update_user_photo(photo: UploadFile, db: Session = Depends(get_db), user_id: str = Depends(require_user)):
	user_query = db.query(User).filter(User.id == user_id)
	check_user = user_query.first()

	if not check_user:
		raise HTTPException(status_code=404, detail="User doesn't exist")
	
	key = FOLDER + user_id + photo.filename

	if check_user.photo:
		old_key = check_user.photo.replace(settings.S3_FULL_URL,'')
		s3.delete_photo(old_key)
	
	s3.add_new_photo(photo.file, key)

	user_query.update({'photo': f'{settings.S3_FULL_URL + key}'}, synchronize_session=False)
	db.commit()
	db.refresh(check_user)

	return {'status': 'OK'}

@router.delete('/delete_photo')
def delete_user_photo(db: Session = Depends(get_db), user_id: str = Depends(require_user)):
	user_query = db.query(User).filter(User.id == user_id)
	check_user = user_query.first()

	if not check_user:
		raise HTTPException(status_code=404, detail="User doesn't exist")

	key = check_user.photo.replace(settings.S3_FULL_URL,'')
	s3.delete_photo(key)

	user_query.update({'photo': ''}, synchronize_session=False)
	db.commit()
	db.refresh(check_user)

	return {'status': 'OK'}

# ADMIN

# GET ALL USERS

@router.get('/all', response_model=List[user_scheme.UserResponse])
def get_all_users(db: Session = Depends(get_db), user_id: str = Depends(require_user)):
	users = db.query(User).filter(User.role != 'admin').order_by(asc(User.username)).all()
	return users

# CHANGE USERS'S ROLE

@router.patch('/change_role/{username}')
def update_user_role(username: str, db: Session = Depends(get_db), user_id: str = Depends(require_user)):
	user_query = db.query(User).filter(User.username == username)
	check_user = user_query.first()

	if not check_user:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User doesn't exist")

	if check_user.role == 'user':
		user_query.update({'role': 'editor'}, synchronize_session=False)
	elif check_user.role == 'editor':
		user_query.update({'role': 'user'}, synchronize_session=False)

	db.commit()
	db.refresh(check_user)

	return {'status': 'success', 'message': 'OK'}

# DELETE USER

@router.delete('/delete/{username}')
def delete_user(username: str, db: Session = Depends(get_db), user_id: str = Depends(require_user)):
	user_query = db.query(User).filter(User.username == username)
	check_user = user_query.first()

	if not check_user:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User doesn't exist")

	if check_user.photo:
		key = check_user.photo.replace(settings.S3_FULL_URL,'')
		s3.delete_photo(key)

	user_query.delete(synchronize_session=False)
	db.commit()
	
	return {'status': 'success', 'message': 'OK'}

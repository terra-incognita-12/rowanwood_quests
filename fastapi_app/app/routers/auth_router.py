import random
import time
from datetime import timedelta
from fastapi import (
	APIRouter, 
	Request, 
	Response, 
	status,
	Depends,
	HTTPException,
	UploadFile
)
from sqlalchemy.orm import Session
from pydantic import EmailStr
from fastapi.responses import RedirectResponse

from ..send_email.email import Email
from ..s3 import s3
from ..oauth2 import AuthJWT, require_user
from ..schemes import user_scheme
from ..models import User
from ..hasher import Hasher
from ..email_token import EmailToken
from ..password_token import PasswordToken
from ..database import get_db
from ..config import settings

router = APIRouter()

ACCESS_X = int(settings.ACCESS_TOKEN_EXPIRES)
REFRESH_X = int(settings.REFRESH_TOKEN_EXPIRES)

FOLDER = 'user/'

@router.post('/register', status_code=status.HTTP_201_CREATED)
async def create_user(payload: user_scheme.CreateUserScheme, request: Request, db: Session = Depends(get_db)):
	if payload.password != payload.password_confirm:
	   	raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Passwords do not match')
	
	check_user = db.query(User).filter(User.email == EmailStr(payload.email.lower())).first()
	if check_user:
		raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Account with this credentials already exists')

	payload.password = Hasher.get_password_hash(payload.password)
	del payload.password_confirm

	payload.role = 'user'
	payload.is_email_verified = False
	payload.email = EmailStr(payload.email.lower())

	new_user = User(**payload.dict())
	db.add(new_user)
	db.commit()
	db.refresh(new_user)

	try:
		token = EmailToken.get_email_token(payload.username, settings.EMAIL_TOKEN_EXPIRES_SECONDS)
		url = f"{request.url.scheme}://{request.client.host}:{request.url.port}/auth/verify_email/{token}"
		await Email(new_user, url, [payload.email]).send_verification_email_link()
	except Exception as error:
		print(error)
		raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail='There was an error sending email')

	return {'status': 'success', 'message': 'Verification token successfully sent to your email', 'id': new_user.id}

@router.post('/login')
async def login(payload: user_scheme.LoginUserScheme, request: Request, response: Response, db: Session = Depends(get_db), Authorize: AuthJWT = Depends()):
	user = db.query(User).filter(User.email == EmailStr(payload.email.lower())).first()
	if not user or not Hasher.verify_password(payload.password, user.password):
		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Incorrect Email or Password')
	
	if not user.is_email_verified:
		try:
			token = EmailToken.get_email_token(user.username, settings.EMAIL_TOKEN_EXPIRES_SECONDS)
			url = f"{request.url.scheme}://{request.client.host}:{request.url.port}/auth/verify_email/{token}"
			await Email(user, url, [payload.email]).send_verification_email_link()
		except Exception as error:
			print(error)
			raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail='Your email is not verified, but it was an error sending email, try to login next time')
		raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Your email is not verified, please verify your email address, link was sent on your email')

	access_token = Authorize.create_access_token(subject=str(user.id), expires_time=timedelta(minutes=ACCESS_X))
	refresh_token = Authorize.create_refresh_token(subject=str(user.id), expires_time=timedelta(minutes=REFRESH_X))

	response.set_cookie('access_token', access_token, ACCESS_X*60, ACCESS_X*60, '/', None, False, True, 'lax')
	response.set_cookie('refresh_token', refresh_token, REFRESH_X*60, REFRESH_X*60, '/', None, False, True, 'lax')
	response.set_cookie('logged_in', 'True', ACCESS_X*60, ACCESS_X*60, '/', None, False, False, 'lax')

	return {'id': user.id, 'username': user.username, 'status': 'success', 'role': user.role, 'access_token': access_token, 'photo': user.photo}

@router.get('/logout')
def logout(response: Response, Authorize: AuthJWT = Depends(), user_id: str = Depends(require_user)):
	Authorize.unset_jwt_cookies()
	response.set_cookie('logged_in', '', -1)

	return {'status': 'success'}

@router.get('/verify_email/{token}', response_class=RedirectResponse, status_code=302)
def email_verification(token: str, db: Session = Depends(get_db)):
	token_decode = EmailToken.decode_token(token)
	username = token_decode[0]
	expire_time = token_decode[1]
	if time.time() > expire_time:
		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Link is expired')

	user_query = db.query(User).filter(User.username == username)
	check_user = user_query.first()
	if not check_user:
		raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid token or user doesn't exist")
	if check_user.is_email_verified:
		raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Email can only be verified once')

	user_query.update({'is_email_verified': True}, synchronize_session=False)
	db.commit()

	# return {
	# 	"status": "success",
	# 	"message": "Account verified successfully"
	# }
	return "http://localhost:3000/"

@router.post('/forget_password')
async def forget_password(payload: user_scheme.ForgetPasswordUserScheme, request: Request, db: Session = Depends(get_db)):
	user = db.query(User).filter(User.email == EmailStr(payload.email.lower())).first()
	if not user:
		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User with this email don't exsist")
	
	token = EmailToken.get_email_token(user.username, settings.EMAIL_TOKEN_EXPIRES_SECONDS)
	try:
		if not user.is_email_verified:
			url = f"{request.url.scheme}://{request.client.host}:{request.url.port}/auth/verify_email/{token}"
			await Email(user, url, [payload.email]).send_verification_email_link()
		else:
			url = f"{request.url.scheme}://{request.client.host}:{request.url.port}/auth/verify_change_password/{token}"
			await Email(user, url, [payload.email]).send_verification_change_password_link()
			return {'status': 'success', 'message': 'Password recover link was sent to your email'}

	except Exception as error:
		print(error)
		raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail='There was an error sending email')

	raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Your email is not verified, please verify your email address, link was sent on your email')

@router.get('/verify_change_password/{token}', response_class=RedirectResponse, status_code=302)
def change_password_verification(token: str, db: Session = Depends(get_db)):
	token_decode = EmailToken.decode_token(token)
	username = token_decode[0]
	expire_time = token_decode[1]
	if time.time() > expire_time:
		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Link is expired')

	user_query = db.query(User).filter(User.username == username)
	check_user = user_query.first()
	if not check_user:
		raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid token or user doesn't exist")

	# password_token = EmailToken.get_email_token(str(random.randint(10000, 99999)), settings.EMAIL_TOKEN_EXPIRES_SECONDS)
	password_token = EmailToken.get_email_token(check_user.username, settings.EMAIL_TOKEN_EXPIRES_SECONDS)
	user_query.update({'password_token': password_token}, synchronize_session=False)
	db.commit()

	# return {
	# 	"status": "success",
	# 	"username": username,
	# 	"password_token": password_token
	# }
	return f"http://localhost:3000/changepass/{password_token}"

@router.post('/confirm_change_password')
def confirm_change_password(payload: user_scheme.ChangePasswordWithTokenUserScheme, db: Session = Depends(get_db)):
	if payload.new_password != payload.new_password_confirm:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Passwords do not match')

	token_decode = EmailToken.decode_token(payload.password_token)
	username = token_decode[0]
	expire_time = token_decode[1]
	if time.time() > expire_time:
		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Link is expired')

	user_query = db.query(User).filter(User.username == username)
	check_user = user_query.first()

	if not check_user:
		raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User doesn't exist")
	if check_user.password_token != payload.password_token:
		raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Invalid token')

	payload.new_password = Hasher.get_password_hash(payload.new_password)

	user_query.update({'password': payload.new_password, 'password_token': None}, synchronize_session=False)
	db.commit()

	return {
		"status": "success",
		"message": "Password changed successfully"
	}

@router.post('/check_valid_change_password_token')
def check_valid_change_password_token(payload: user_scheme.ChangePasswordTokenScheme, db: Session = Depends(get_db)):
	check_user = db.query(User).filter(User.password_token == payload.password_token).first()
	if not check_user:
		raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User doesn't exist")

	return {"status": "OK"}

@router.get('/refresh')
def refresh_token(response: Response, request: Request, Authorize: AuthJWT = Depends(), db: Session = Depends(get_db)):
	try:
		Authorize.jwt_refresh_token_required()

		user_id = Authorize.get_jwt_subject()
		print(user_id)
		if not user_id:
			raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Can't refresh access token")
		user = db.query(User).filter(User.id == user_id).first()
		if not user:
			raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='The user belonging to this token no logger exist')
		access_token = Authorize.create_access_token(subject=str(user.id), expires_time=timedelta(minutes=ACCESS_X))
	except Exception as e:
		error = e.__class__.__name__
		if error == 'MissingTokenError':
			raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Please provide refresh token')
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)

	response.set_cookie('access_token', access_token, ACCESS_X*60, ACCESS_X*60, '/', None, False, True, 'lax')
	response.set_cookie('logged_in', 'True', ACCESS_X*60, ACCESS_X*60, '/', None, False, False, 'lax')

	return {'id': user.id, 'username': user.username, 'email': user.email, 'role': user.role, 'access_token': access_token, 'photo': user.photo}

@router.get('/verify_user')
def verify_user(db: Session = Depends(get_db), user_id: str = Depends(require_user)):
	user = db.query(User).filter(User.id == user_id).first()
	return {"status": "OK"}

@router.post('/change_username')
def change_username(payload: user_scheme.ChangeUsernameOrEmailScheme, Authorize: AuthJWT = Depends(), db: Session = Depends(get_db)):
	user_query = db.query(User).filter(User.email == EmailStr(payload.email.lower()))
	check_user = user_query.first()

	check_username = db.query(User).filter(User.username == payload.username).first()

	if not check_user:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User doesn't exist")

	if not Hasher.verify_password(payload.password, check_user.password):
		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Wrong password")

	if check_username:
		raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='User with this username already exists')

	user_query.update({'username': payload.username}, synchronize_session=False)
	db.commit()

	return {'success': 'OK'}

@router.post('/change_email')
async def change_email(payload: user_scheme.ChangeUsernameOrEmailScheme, request: Request, Authorize: AuthJWT = Depends(), db: Session = Depends(get_db)):
	check_user = db.query(User).filter(User.username == payload.username).first()
	check_email = db.query(User).filter(User.email == EmailStr(payload.email.lower())).first()

	if not check_user:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User doesn't exist")

	if not Hasher.verify_password(payload.password, check_user.password):
		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Wrong password")

	if check_email:
		raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='User with this email already exists')

	token = EmailToken.get_change_email_token(check_user.email, payload.email, settings.EMAIL_TOKEN_EXPIRES_SECONDS)
	try:
		url = f"{request.url.scheme}://{request.client.host}:{request.url.port}/auth/verify_change_email/{token}"
		await Email(check_user, url, [payload.email]).send_verification_change_email_link()
		
		return {'status': 'success', 'message': 'Change email link was sent to your new email'}

	except Exception as error:
		print(error)
		raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail='There was an error sending email')

@router.get('/verify_change_email/{token}', response_class=RedirectResponse, status_code=302)
def email_verification(token: str, db: Session = Depends(get_db)):
	token_decode = EmailToken.decode_change_email_token(token)
	old_email = token_decode[0]
	new_email = token_decode[1]
	expire_time = token_decode[2]
	if time.time() > expire_time:
		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Link is expired')

	user_query = db.query(User).filter(User.email == EmailStr(old_email.lower()))
	check_user = user_query.first()
	if not check_user:
		raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid token or user doesn't exist")

	user_query.update({'email': new_email}, synchronize_session=False)
	db.commit()

	# return {
	# 	"status": "success",
	# 	"message": "Account verified successfully"
	# }
	return "http://localhost:3000/profile"

@router.post('/change_password_notoken')
def change_password_notoken(payload: user_scheme.ChangePasswordWithoutTokenUserScheme, Authorize: AuthJWT = Depends(), db: Session = Depends(get_db)):
	user_query = db.query(User).filter(User.email == EmailStr(payload.email.lower()))
	check_user = user_query.first()

	if not check_user:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User doesn't exist")

	if not Hasher.verify_password(payload.old_password, check_user.password):
		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Wrong password")

	if payload.new_password != payload.new_password_confirm:
		raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Passwords do not match')

	payload.new_password = Hasher.get_password_hash(payload.new_password)

	user_query.update({'password': payload.new_password}, synchronize_session=False)
	db.commit()

	return {'success': 'OK'}

# S3

@router.patch('/update_photo/{id}')
def update_user_photo(id: str, photo: UploadFile, db: Session = Depends(get_db)):
	user_query = db.query(User).filter(User.id == id)
	check_user = user_query.first()

	if not check_user:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User doesn't exist")
	
	key = FOLDER + id + photo.filename

	if check_user.photo:
		old_key = check_user.photo.replace(settings.S3_FULL_URL,'')
		s3.delete_photo(old_key)
	
	s3.add_new_photo(photo.file, key)

	user_query.update({'photo': f'{settings.S3_FULL_URL + key}'}, synchronize_session=False)
	db.commit()
	db.refresh(check_user)

	return {'status': 'success', 'message': 'OK'}

@router.delete('/delete_photo/{id}')
def delete_user_photo(id: str, db: Session = Depends(get_db)):
	user_query = db.query(User).filter(User.id == id)
	check_user = user_query.first()

	if not check_user:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User doesn't exist")

	key = check_user.photo.replace(settings.S3_FULL_URL,'')
	s3.delete_photo(key)

	user_query.update({'photo': ''}, synchronize_session=False)
	db.commit()
	db.refresh(check_user)

	return {'status': 'success', 'message': 'OK'}
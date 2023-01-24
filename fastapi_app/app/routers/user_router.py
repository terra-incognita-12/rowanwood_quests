from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import asc
from typing import List

from ..database import get_db
from ..s3 import s3
from ..config import settings
from ..models import User
from ..schemes import user_scheme
from ..oauth2 import require_user

router = APIRouter()

@router.get('/all', response_model=List[user_scheme.UserResponse])
def get_all_users(db: Session = Depends(get_db), user_id: str = Depends(require_user)):
	users = db.query(User).filter(User.role != 'admin').order_by(asc(User.username)).all()
	return users

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

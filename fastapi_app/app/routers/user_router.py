from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import User
from schemes import user_scheme
from oauth2 import require_user

router = APIRouter()

@router.get('/me', response_model=user_scheme.UserResponse)
def get_me(db: Session = Depends(get_db), user_id: str = Depends(require_user)):
	user = db.query(User).filter(User.id == user_id).first()
	return user

# @router.post('/change_password')
# def change_password(db: Session = Depends(get_db), user_id: str = Depends(require_user)):
# 	user = db.query(User).filter(User.id == user_id).first()
# 	
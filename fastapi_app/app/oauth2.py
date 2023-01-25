import base64
from typing import List
from fastapi_jwt_auth import AuthJWT
from pydantic import BaseModel
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status

from .config import settings
from .database import get_db
from .models import User

class Settings(BaseModel):
	authjwt_algorithm: str = settings.JWT_ALGORITHM
	authjwt_decode_algorithm: List[str] = [settings.JWT_ALGORITHM]
	authjwt_token_location: set = {'cookies', 'headers'}
	authjwt_access_cookie_key: str = 'access_token'
	authjwt_refresh_cookie_key: str = 'refresh_token'
	authjwt_cookie_csrf_protect: bool = False
	authjwt_private_key:str = base64.b64decode(settings.JWT_PRIVATE_KEY).decode('utf-8')
	authjwt_public_key: str = base64.b64decode(settings.JWT_PUBLIC_KEY).decode('utf-8')

@AuthJWT.load_config
def get_config():
	return Settings()

def require_user(db: Session = Depends(get_db), Authorize: AuthJWT = Depends()):
    try:
        Authorize.jwt_required()
        user_id = Authorize.get_jwt_subject()
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='User no longer exist')
        if not user.is_email_verified:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User's email is not verified")
    except Exception as e:
        error = e.__class__.__name__
        if error == 'MissingTokenError':
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='You are not logged in')
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Token is invalid or has expired')
    return user_id

def require_editor(db: Session = Depends(get_db), Authorize: AuthJWT = Depends()):
    try:
        Authorize.jwt_required()
        user_id = Authorize.get_jwt_subject()
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='User no longer exist')
        if not user.is_email_verified:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User's email is not verified")
        if user.role == 'user':
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is unauthorized for that action")
    except Exception as e:
        error = e.__class__.__name__
        if error == 'MissingTokenError':
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='You are not logged in')
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Token is invalid or has expired')
    return user_id

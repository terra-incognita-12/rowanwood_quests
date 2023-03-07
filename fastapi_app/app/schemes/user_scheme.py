import uuid
from datetime import datetime
from pydantic import BaseModel, EmailStr, constr
from typing import List, Union

class UserBaseScheme(BaseModel):
	username: str
	email: str

	class Config:
		orm_mode = True

class CreateUserScheme(UserBaseScheme):
	password: str
	password_confirm: str
	role: str = 'user'
	is_email_verified: bool = False

class LoginUserScheme(BaseModel):
	email: EmailStr
	password: str

class ForgetPasswordUserScheme(BaseModel):
	email: EmailStr

class ChangePasswordWithTokenUserScheme(BaseModel):
	password_token: str
	new_password: str
	new_password_confirm: str

class ChangePasswordWithoutTokenUserScheme(BaseModel):
	old_password: str
	new_password: str
	new_password_confirm: str

class ChangePasswordTokenScheme(BaseModel):
	password_token: str

class UserResponse(UserBaseScheme):
	id: uuid.UUID
	role: str

class ForeignKeyUserResponse(UserBaseScheme):
	id: uuid.UUID
	photo: Union[str, None] = None

class ChangeUsernameScheme(BaseModel):
	username: str
	password: str

class ChangeEmailScheme(BaseModel):
	email: EmailStr
	password: str
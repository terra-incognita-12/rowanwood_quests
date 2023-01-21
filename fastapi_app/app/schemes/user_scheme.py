import uuid
from datetime import datetime
from pydantic import BaseModel, EmailStr, constr

class UserBaseScheme(BaseModel):
	username: str
	email: str

	class Config:
		orm_mode = True

class CreateUserScheme(UserBaseScheme):
	password: constr(min_length=8)
	password_confirm: str
	role: str = 'user'
	is_email_verified: bool = False

class LoginUserScheme(BaseModel):
	email: EmailStr
	password: constr(min_length=8)

class ForgetPasswordUserScheme(BaseModel):
	email: EmailStr

class ChangePasswordWithTokenUserScheme(BaseModel):
	password_token: str
	new_password: constr(min_length=8)
	new_password_confirm: str

class ChangePasswordWithoutTokenUserScheme(BaseModel):
	email: EmailStr
	old_password: str
	new_password: constr(min_length=8)
	new_password_confirm: str

class ChangePasswordTokenScheme(BaseModel):
	password_token: str

class UserResponse(UserBaseScheme):
	id: uuid.UUID
	role: str
	created_at: datetime
	updated_at: datetime

class ForeignKeyUserResponse(UserBaseScheme):
	id: uuid.UUID

class ChangeUsernameOrEmailScheme(LoginUserScheme):
	username: str
import uuid
from datetime import datetime
from pydantic import BaseModel, EmailStr, constr

class UserBaseScheme(BaseModel):
	username: str
	email: str
	photo: str

	class Config:
		orm_more = True

class CreateUserScheme(UserBaseScheme):
	password: constr(min_length=8)
	password_confirm: str
	role: str = 'user'
	is_email_verified: bool = False

class LoginUserScheme(BaseModel):
	email: EmailStr
	password: constr(min_length=8)

class UserResponse(UserBaseScheme):
	id: uuid.UUID
	created_at: datetime
	updated_at: datetime
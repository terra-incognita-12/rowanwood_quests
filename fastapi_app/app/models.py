import uuid
from sqlalchemy import TIMESTAMP, Column, String, Boolean, text
from sqlalchemy.dialects.postgresql import UUID

from database import Base

class User(Base):
	__tablename__ = 'users'

	id = Column(UUID(as_uuid=True), primary_key=True, nullable=False, default=uuid.uuid4)
	username = Column(String, unique=True)
	email = Column(String, unique=True)
	password = Column(String)
	photo = Column(String, nullable=True)
	is_email_verified = Column(Boolean, default=False)
	password_token = Column(String, nullable=True, unique=True)
	role = Column(String, default='user')
	created_at = Column(TIMESTAMP(timezone=True), server_default=text('now()'))
	updated_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"))

import uuid
from sqlalchemy import TIMESTAMP, Column, String, ForeignKey, Boolean, text, TEXT
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID

from .database import Base

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
	updated_at = Column(TIMESTAMP(timezone=True), server_default=text('now()'))

	user_comments = relationship('Comment', back_populates='user')

class Quest(Base):
	__tablename__ = 'quests'

	id = Column(UUID(as_uuid=True), primary_key=True, nullable=False, default=uuid.uuid4)
	name = Column(String)
	url = Column(String, unique=True)
	telegram_url = Column(String, unique=True)
	brief_description = Column(String)
	full_description = Column(TEXT)
	photo = Column(String, nullable=True)
	created_at = Column(TIMESTAMP(timezone=True), server_default=text('now()'))
	updated_at = Column(TIMESTAMP(timezone=True), server_default=text('now()'))

	quest_comments = relationship('Comment', back_populates='quest')

class Comment(Base):
	__tablename__ = 'comments'

	id = Column(UUID(as_uuid=True), primary_key=True, nullable=False, default=uuid.uuid4)
	text_comment = Column(TEXT)
	created_at = Column(TIMESTAMP(timezone=True), server_default=text('now()'))
	updated_at = Column(TIMESTAMP(timezone=True), server_default=text('now()'))
	user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
	quest_id = Column(UUID(as_uuid=True), ForeignKey('quests.id', ondelete='CASCADE'), nullable=False)

	user = relationship('User', back_populates='user_comments')
	quest = relationship('Quest', back_populates='quest_comments')
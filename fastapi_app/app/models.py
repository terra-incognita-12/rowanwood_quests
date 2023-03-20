import uuid
from sqlalchemy import TIMESTAMP, Column, String, ForeignKey, Boolean, text, TEXT, Table, Integer, desc
from sqlalchemy.orm import relationship, backref
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
	is_activated = Column(Boolean, default=False, nullable=False)
	created_at = Column(TIMESTAMP(timezone=True), server_default=text('now()'))
	updated_at = Column(TIMESTAMP(timezone=True), server_default=text('now()'))

	quest_comments = relationship('Comment', back_populates='quest', order_by='Comment.created_at')
	quest_lines = relationship('QuestLine', back_populates='quest', order_by='QuestLine.unique_number')

class QuestActivationRequest(Base):
    __tablename__ = 'quest_activation_requests'

    id = Column(UUID(as_uuid=True), primary_key=True, nullable=False, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    quest_id = Column(UUID(as_uuid=True), ForeignKey('quests.id', ondelete='CASCADE'), nullable=False)

    user_requested = relationship('User', backref=backref('user_requested', cascade="all,delete"), foreign_keys=[user_id])
    quest_requested = relationship('Quest', backref=backref('quest_requested',cascade="all,delete"), foreign_keys=[quest_id])

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

class LibraryRecord(Base):
	__tablename__ = 'library_record'

	id = Column(UUID(as_uuid=True), primary_key=True, nullable=False, default=uuid.uuid4)
	name = Column(String)
	url = Column(String, unique=True)
	description = Column(TEXT)
	photo = Column(String, nullable=True)
	
	library_tags = relationship('LibraryTag', secondary='library_records_tags', back_populates='library_records')

class LibraryTag(Base):
	__tablename__ = 'library_tag'

	id = Column(UUID(as_uuid=True), primary_key=True, nullable=False, default=uuid.uuid4)
	name = Column(String, unique=True)

	library_records = relationship('LibraryRecord', secondary='library_records_tags', back_populates='library_tags')

library_records_tags = Table('library_records_tags', Base.metadata, 
	Column('library_record_id', ForeignKey('library_record.id'), primary_key=True),
	Column('library_tag_id', ForeignKey('library_tag.id'), primary_key=True),
)

class QuestLine(Base):
	__tablename__ = 'quest_line'

	id = Column(UUID(as_uuid=True), primary_key=True, nullable=False, default=uuid.uuid4)
	name = Column(String)
	unique_number = Column(Integer)
	photo = Column(String, nullable=True)
	description = Column(String)
	quest_id = Column(UUID(as_uuid=True), ForeignKey('quests.id', ondelete='CASCADE'), nullable=False)

	quest = relationship('Quest', back_populates='quest_lines')
	
class QuestOption(Base):
	__tablename__ = 'quest_option'

	id = Column(UUID(as_uuid=True), primary_key=True, nullable=False, default=uuid.uuid4)
	name = Column(String)
	quest_current_line_id = Column(UUID(as_uuid=True), ForeignKey('quest_line.id', ondelete='CASCADE'), nullable=False)
	quest_next_line_id = Column(UUID(as_uuid=True), ForeignKey('quest_line.id', ondelete='CASCADE'), nullable=False)

	quest_current_line = relationship('QuestLine', backref=backref('quest_current_options', cascade="all,delete"), foreign_keys=[quest_current_line_id])
	quest_next_line = relationship('QuestLine', backref=backref('quest_next',cascade="all,delete"), foreign_keys=[quest_next_line_id])

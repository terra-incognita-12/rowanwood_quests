import uuid
from pydantic import BaseModel
from typing import Union
from datetime import datetime

from .user_scheme import ForeignKeyUserResponse

class CommentsBaseScheme(BaseModel):
	text_comment: str
	# user_id: Union[uuid.UUID, None] = None

	class Config:
		orm_mode = True

class CreateCommentScheme(CommentsBaseScheme):
	user_id: Union[uuid.UUID, None] = None
	quest_url: str

class DeleteCommentScheme(BaseModel):
	id: uuid.UUID

class CommentResponseScheme(CommentsBaseScheme):
	id: uuid.UUID
	created_at: datetime
	user: ForeignKeyUserResponse
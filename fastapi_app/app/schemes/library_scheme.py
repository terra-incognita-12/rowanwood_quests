import uuid
from fastapi import UploadFile
from pydantic import BaseModel
from typing import List

class LibraryRecordBaseScheme(BaseModel):
	name: str
	url: str
	description: str
	photo: str

	class Config:
		orm_mode = True

class LibraryTagBaseScheme(BaseModel):
	name: str

	class Config:
		orm_mode = True

class LibraryRecordSendScheme(LibraryRecordBaseScheme):
	library_tags: List[LibraryTagBaseScheme]

class LibraryRecordResponseScheme(LibraryRecordBaseScheme):
	id: uuid.UUID
	library_tags: List[LibraryTagBaseScheme]

class LibraryRecordResponseWithoutTagsScheme(LibraryRecordBaseScheme):
	id: uuid.UUID

class LibraryTagSendScheme(LibraryTagBaseScheme):
	pass

class LibraryTagResponseScheme(LibraryTagBaseScheme):
	id: uuid.UUID
	library_records: List[LibraryRecordResponseWithoutTagsScheme]
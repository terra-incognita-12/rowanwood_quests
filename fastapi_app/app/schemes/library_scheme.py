import uuid
from fastapi import UploadFile
from pydantic import BaseModel
from typing import List, Union

class LibraryRecordBaseScheme(BaseModel):
	name: str
	url: str
	description: str

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
	photo: Union[str, None] = None
	library_tags: List[LibraryTagBaseScheme]

class LibraryRecordResponseWithoutTagsScheme(LibraryRecordBaseScheme):
	id: uuid.UUID
	photo: Union[str, None] = None

class LibraryTagSendScheme(LibraryTagBaseScheme):
	pass

class LibraryTagResponseScheme(LibraryTagBaseScheme):
	id: uuid.UUID
	library_records: List[LibraryRecordResponseWithoutTagsScheme]
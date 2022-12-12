import uuid
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

class LibraryRecordResponseScheme(LibraryRecordSendScheme):
	id: uuid.UUID

class LibraryTagResponseScheme(LibraryTagBaseScheme):
	library_records: List[LibraryRecordBaseScheme]
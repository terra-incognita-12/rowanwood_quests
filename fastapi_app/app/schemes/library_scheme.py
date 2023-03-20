import uuid
from fastapi import UploadFile
from pydantic import BaseModel
from typing import List, Union

# RECORD base

class LibraryRecordBaseScheme(BaseModel):
	name: str
	url: str
	description: str

	class Config:
		orm_mode = True

# TAG base

class LibraryTagBaseScheme(BaseModel):
	name: str

	class Config:
		orm_mode = True

# RECORD send, response

class LibraryRecordSendScheme(LibraryRecordBaseScheme):
	library_tags: List[LibraryTagBaseScheme]

class LibraryRecordResponseSchemePreview(BaseModel):
	name: str
	url: str

	class Config:
		orm_mode = True

class LibraryRecordResponseScheme(LibraryRecordBaseScheme):
	id: uuid.UUID
	photo: Union[str, None] = None
	library_tags: List[LibraryTagBaseScheme]

# TAG send, response

class LibraryTagSendScheme(LibraryTagBaseScheme):
	pass
	
class LibraryTagResponseScheme(LibraryTagBaseScheme):
	id: uuid.UUID
	library_records: List[LibraryRecordResponseSchemePreview]
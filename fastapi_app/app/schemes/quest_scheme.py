import uuid
from pydantic import BaseModel
from typing import List, Union

from .comment_scheme import CommentResponseScheme

class QuestBaseScheme(BaseModel):
    name: str
    url: str
    telegram_url: str
    brief_description: str
    full_description: str
    photo: str

    class Config:
        orm_mode = True

class QuestOptionBaseScheme(BaseModel):
    unique_name: str
    description: str

    class Config:
        orm_mode = True

class QuestOptionSendScheme(QuestOptionBaseScheme):
    quest_line_id: Union[uuid.UUID, None] = None

class QuestOptionResponseScheme(QuestOptionBaseScheme):
    id: uuid.UUID

class QuestLineBaseScheme(BaseModel):
    name: str
    unique_number: int
    photo: str
    description: str

    class Config:
        orm_mode = True

class QuestLineSendScheme(QuestLineBaseScheme):
    quest_id: Union[uuid.UUID, None] = None 

class QuestLineResponseScheme(QuestLineBaseScheme):
    id: uuid.UUID
    quest_options: List[QuestOptionResponseScheme] = []

class QuestResponseSchemeWithComments(QuestBaseScheme):
    id: uuid.UUID
    quest_comments: List[CommentResponseScheme] = []

class QuestResponseSchemeWithLines(QuestBaseScheme):
    id: uuid.UUID
    quest_lines: List[QuestLineResponseScheme] = []


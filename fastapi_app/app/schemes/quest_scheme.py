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
    is_activated: bool

    class Config:
        orm_mode = True

class QuestSendScheme(QuestBaseScheme):
    pass

class QuestOptionBaseScheme(BaseModel):
    name: str

    class Config:
        orm_mode = True

class QuestOptionSendScheme(QuestOptionBaseScheme):
    quest_next_line_id: Union[uuid.UUID, None] = None

class QuestLineBaseScheme(BaseModel):
    name: str
    unique_number: int
    description: str

    class Config:
        orm_mode = True

class QuestNextLineScheme(BaseModel):
    id: Union[uuid.UUID, None] = None
    name: str
    unique_number: int

    class Config:
        orm_mode = True

class QuestOptionResponseScheme(QuestOptionBaseScheme):
    id: uuid.UUID
    quest_next_line: QuestNextLineScheme = None

class QuestLineSendScheme(QuestLineBaseScheme):
    quest_current_options: List[QuestOptionSendScheme] = [] 

class QuestLineResponseScheme(QuestLineBaseScheme):
    id: uuid.UUID
    photo: Union[str, None] = None
    quest_current_options: List[QuestOptionResponseScheme] = []

class QuestResponseSchemePreview(QuestBaseScheme):
    id: uuid.UUID
    photo: Union[str, None] = None

class QuestDropDownResponseScheme(BaseModel):
    name: str
    url: str

    class Config:
        orm_mode = True

class QuestResponseSchemeWithComments(QuestBaseScheme):
    id: uuid.UUID
    photo: Union[str, None] = None
    quest_comments: List[CommentResponseScheme] = []

class QuestResponseSchemeWithLines(QuestBaseScheme):
    id: uuid.UUID
    photo: Union[str, None] = None
    quest_lines: List[QuestLineResponseScheme] = []




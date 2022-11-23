import uuid
from pydantic import BaseModel
from typing import List

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

class CreateQuestScheme(QuestBaseScheme):
    pass

class QuestResponseScheme(QuestBaseScheme):
    quest_comments: List[CommentResponseScheme] = []
    
class ForeignKeyQuestResponse(QuestBaseScheme):
    id: uuid.UUID
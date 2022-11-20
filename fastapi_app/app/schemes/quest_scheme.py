import uuid
from pydantic import BaseModel

class QuestBaseScheme(BaseModel):
    name: str
    brief_description: str
    full_description: str
    photo: str

class CreateQuestScheme(QuestBaseScheme):
    pass

class QuestResponse(QuestBaseScheme):
    id: uuid.UUID
    
    class Config:
        orm_mode = True
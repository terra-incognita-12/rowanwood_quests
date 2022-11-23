from fastapi import (
    APIRouter, 
    Depends,
    status
)
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Quest, Comment
from ..schemes import quest_scheme

router = APIRouter()

@router.post('/create', status_code=status.HTTP_201_CREATED)
def create_quest(payload: quest_scheme.CreateQuestScheme, db: Session = Depends(get_db)):
    new_quest = Quest(**payload.dict())
    db.add(new_quest)
    db.commit()
    db.refresh(new_quest)

    return {'status': 'success', 'message': 'Quest created succesfully'}

@router.get('/all', response_model=List[quest_scheme.QuestResponseScheme])
def get_all_quests(db: Session = Depends(get_db)):
    quests = db.query(Quest).all()
    return quests

@router.get('/{url}', response_model=quest_scheme.QuestResponseScheme)
def get_quest(url: str, db: Session = Depends(get_db)):
    quest = db.query(Quest).filter(Quest.url == url).first()

    if not quest:
        raise HTTPException(status_code=404, detail="Quest doesn't exist")

    return quest

# @router.get('/me', response_model=user_scheme.UserResponse)
# def get_me(db: Session = Depends(get_db), user_id: str = Depends(require_user)):
# 	user = db.query(User).filter(User.id == user_id).first()
# 	return user
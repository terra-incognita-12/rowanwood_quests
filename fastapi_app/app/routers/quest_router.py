from fastapi import (
    APIRouter, 
    Depends,
    status
)
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Quest
from ..schemes import quest_scheme

router = APIRouter()

@router.post('/create', status_code=status.HTTP_201_CREATED)
def create_quest(payload: quest_scheme.CreateQuestScheme, db: Session = Depends(get_db)):
    new_quest = Quest(**payload.dict())
    db.add(new_quest)
    db.commit()
    db.refresh(new_quest)

    return {'status': 'success', 'message': 'Quest created succesfully'}

@router.get('/all', response_model=List[quest_scheme.QuestResponse])
def get_all_quests(db: Session = Depends(get_db)):
    quests = db.query(Quest).all()
    return quests

# @router.get('/me', response_model=user_scheme.UserResponse)
# def get_me(db: Session = Depends(get_db), user_id: str = Depends(require_user)):
# 	user = db.query(User).filter(User.id == user_id).first()
# 	return user
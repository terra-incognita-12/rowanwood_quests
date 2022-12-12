from fastapi import (
    APIRouter, 
    Depends,
    status,
    HTTPException
)
from sqlalchemy.orm import Session
from sqlalchemy import asc
from typing import List
from ..database import get_db
from ..models import Quest, Comment
from ..schemes import quest_scheme
from ..oauth2 import require_user

router = APIRouter()

@router.post('/create', status_code=status.HTTP_201_CREATED)
def create_quest(payload: quest_scheme.QuestBaseScheme, db: Session = Depends(get_db), user_id: str = Depends(require_user)):
    check_quest = db.query(Quest).filter(Quest.url == payload.url).first()
    if check_quest:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Quest with this url already exists')

    new_quest = Quest(**payload.dict())
    db.add(new_quest)
    db.commit()
    db.refresh(new_quest)

    return {'status': 'success', 'message': 'OK'}

@router.get('/all', response_model=List[quest_scheme.QuestResponseScheme])
def get_all_quests(db: Session = Depends(get_db)):
    quests = db.query(Quest).order_by(asc(Quest.name)).all()
    return quests

@router.get('/{url}', response_model=quest_scheme.QuestResponseScheme)
def get_quest(url: str, db: Session = Depends(get_db)):
    quest = db.query(Quest).filter(Quest.url == url).first()

    if not quest:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quest doesn't exist")

    return quest

@router.patch('/update/{id}')
def update_quest(id: str, payload:quest_scheme.QuestBaseScheme, db: Session = Depends(get_db)):
    quest_query = db.query(Quest).filter(Quest.id == id)
    check_quest = quest_query.first()

    if not check_quest:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quest doesn't exist")

    check_quest_url = db.query(Quest).filter(Quest.url == payload.url).first()

    if check_quest_url and str(check_quest_url.id) != id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Quest with this url already exists')

    update_data = payload.dict(exclude_unset=True)
    quest_query.update(update_data, synchronize_session=False)

    db.commit()
    db.refresh(check_quest)

    return {'status': 'success', 'message': 'OK'}    

@router.delete('/delete/{url}')
def delete_quest(url: str, db: Session = Depends(get_db)):
    quest_query = db.query(Quest).filter(Quest.url == url)
    check_quest = quest_query.first()

    if not check_quest:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quest doesn't exist")

    quest_query.delete(synchronize_session=False)
    db.commit()
    
    return {'status': 'success', 'message': 'OK'}
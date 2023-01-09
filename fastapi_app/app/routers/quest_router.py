from fastapi import (
    APIRouter, 
    Depends,
    status,
    HTTPException
)
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import asc
from typing import List
from ..database import get_db
from ..models import Quest, Comment, QuestLine, QuestOption
from ..schemes import quest_scheme
from ..oauth2 import require_user

router = APIRouter()

# BASE QUEST

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

# Pull quests only with user comments
@router.get('/all/comments', response_model=List[quest_scheme.QuestResponseSchemeWithComments])
def get_all_quests_with_comments(db: Session = Depends(get_db)):
    quests = db.query(Quest).order_by(asc(Quest.name)).all()
    return quests

# Pull quests only with quest lines
@router.get('/all/lines', response_model=List[quest_scheme.QuestResponseSchemeWithLines])
def get_all_quests_with_lines(db: Session = Depends(get_db)):
    quests = db.query(Quest).order_by(asc(Quest.name)).all()
    return quests

@router.get('/{url}', response_model=quest_scheme.QuestResponseSchemeWithComments)
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

# LINES

@router.post('/lines/create/{url}', status_code=status.HTTP_201_CREATED)
def create_quest_line(url: str, payload: quest_scheme.QuestLineSendScheme, db: Session = Depends(get_db)):
    check_quest = db.query(Quest).filter(Quest.url == url).first()
    if not check_quest:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quest doesn't exist")     
    check_unique_number = db.query(QuestLine).filter(QuestLine.quest_id == check_quest.id, QuestLine.unique_number == payload.unique_number).first()
    if check_unique_number:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Quest line with this unique number already exists')

    payload_quest = []
    for elem in payload.quest_options:
        payload_quest.append(QuestOption(name=elem.name, quest_next_line_id=elem.quest_next_line_id))
    payload.quest_options = payload_quest

    new_quest_line = QuestLine(quest_id=check_quest.id, **payload.dict())
    db.add(new_quest_line)
    db.commit()
    db.refresh(new_quest_line)

    return {'status': 'success', 'message': 'OK'}

@router.get('/lines/all/{url}', response_model=List[quest_scheme.QuestLineResponseScheme])
def get_all_lines_for_quest(url: str, db: Session = Depends(get_db)):
    check_quest = db.query(Quest).filter(Quest.url == url).first()
    if not check_quest:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quest doesn't exist")

    return check_quest.quest_lines

@router.get('/lines/{url}/{unique_number}', response_model=quest_scheme.QuestLineResponseScheme)
def get_line_for_quest(url: str, unique_number: int, db: Session = Depends(get_db)):
    check_quest = db.query(Quest).filter(Quest.url == url).first()
    if not check_quest:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quest doesn't exist")

    check_quest_line = db.query(QuestLine).filter(QuestLine.quest_id == check_quest.id, QuestLine.unique_number == unique_number).first()
    if not check_quest_line:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quest Line doesn't exist")

    return check_quest_line

@router.patch('/lines/update/{id}')
def update_quest_line(id: str, payload: quest_scheme.QuestLineSendScheme, db: Session = Depends(get_db)):
    quest_line_query = db.query(QuestLine).filter(QuestLine.id == id)
    check_quest_line = quest_line_query.first()

    if not quest_line_query:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quest Line doesn't exist")

    check_quest_line_unumber = db.query(QuestLine).filter(QuestLine.unique_number == payload.unique_number).first()

    if check_quest_line_unumber and str(check_quest_line_unumber.id) != id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Quest with this unique number already exists')

    payload_quest = []
    for elem in payload.quest_options:
        payload_quest.append(QuestOption(name=elem.name, quest_next_line_id=elem.quest_next_line_id))
    del payload.quest_options

    update_data = payload.dict(exclude_unset=True)
    check_quest_line.quest_options = payload_quest

    quest_line_query.update(update_data, synchronize_session=False)
    db.commit()
    db.refresh(check_quest_line)

    return {'status': 'success', 'message': 'OK'}  

# OPTIONS

@router.post('/options/create', status_code=status.HTTP_201_CREATED)
def create_quest_option(payload: quest_scheme.QuestOptionSendScheme, db: Session = Depends(get_db)):
    quest_line_query = db.query(QuestLine).options(joinedload(QuestLine.quest_options)).filter(QuestLine.id == payload.quest_line_id)
    check_quest_line = quest_line_query.first()
    if not check_quest_line:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quest Line doesn't exist")

    check_quest_line.quest_options.append(QuestOption(
        unique_name=payload.unique_name,
        description=payload.description
    ))

    db.commit()
    db.refresh(check_quest_line)

    return {'status': 'success', 'message': 'OK'}
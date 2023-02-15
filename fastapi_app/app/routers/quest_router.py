from fastapi import (
    APIRouter,
    Depends,
    status,
    HTTPException,
    UploadFile
)
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import asc
from typing import List
from ..s3 import s3
from ..config import settings
from ..database import get_db
from ..models import Quest, Comment, QuestLine, QuestOption, User, QuestActivationRequest
from ..schemes import quest_scheme
from ..oauth2 import require_user, require_editor

router = APIRouter()

FOLDER_QUEST = 'quest/'
FOLDER_QUESTLINE = 'quest_line/'

# BASE QUEST

# CREATE

@router.post('/create', status_code=status.HTTP_201_CREATED)
def create_quest(payload: quest_scheme.QuestSendScheme, db: Session = Depends(get_db)):

    check_quest_url = db.query(Quest).filter(Quest.url == payload.url).first()
    
    if check_quest_url:
        raise HTTPException(status_code=403, detail='Quest with this url already exists')
    
    check_quest_telegram = db.query(Quest).filter(Quest.telegram_url == payload.telegram_url).first()
    
    if check_quest_telegram:
        raise HTTPException(status_code=403, detail='Quest with this telegram url already exists')

    payload.is_activated = False
    new_quest = Quest(**payload.dict())
    db.add(new_quest)
    db.commit()
    db.refresh(new_quest)

    return {'status': 'OK', 'id': new_quest.id}

# READ

# Pull quests no comments no quests lines
@router.get('/all/preview', response_model=List[quest_scheme.QuestResponseSchemePreview])
def get_all_quests_preview(db: Session = Depends(get_db)):
    quests = db.query(Quest).order_by(asc(Quest.name)).filter(Quest.is_activated == True).all()
    return quests

# Pull quests only name and url for dropdown
@router.get('/all/dropdown', response_model=List[quest_scheme.QuestDropDownResponseScheme])
def get_all_quests_dropdown(db: Session = Depends(get_db)):
    quests = db.query(Quest).order_by(asc(Quest.name)).all()
    return quests

@router.get('/{url}', response_model=quest_scheme.QuestResponseSchemeWithComments)
def get_quest(url: str, db: Session = Depends(get_db)):
    print(url)
    if not url or url == "undefined":
        raise HTTPException(status_code=404, detail="Enter Correct Quest")
    
    quest = db.query(Quest).filter(Quest.url == url).first()

    if not quest:
        raise HTTPException(status_code=404, detail="Quest doesn't exist")

    return quest

# UPDATE

@router.patch('/update/{id}')
def update_quest(id: str, payload:quest_scheme.QuestBaseScheme, db: Session = Depends(get_db)):
    quest_query = db.query(Quest).filter(Quest.id == id)
    check_quest = quest_query.first()

    if not check_quest:
        raise HTTPException(status_code=404, detail="Quest doesn't exist")

    check_quest_url = db.query(Quest).filter(Quest.url == payload.url).first()

    if check_quest_url and str(check_quest_url.id) != id:
        raise HTTPException(status_code=403, detail='Quest with this url already exists')
        
    check_quest_telegram = db.query(Quest).filter(Quest.telegram_url == payload.telegram_url).first()
    
    if check_quest_telegram and str(check_quest_telegram.id) != id:
        raise HTTPException(status_code=403, detail='Quest with this telegram url already exists')

    update_data = payload.dict(exclude_unset=True)
    quest_query.update(update_data, synchronize_session=False)

    db.commit()
    db.refresh(check_quest)

    return {'status': 'OK'}

@router.patch('/update/activate/{id}')
def update_activate_quest(id: str, db: Session = Depends(get_db)):
    quest_query = db.query(Quest).filter(Quest.id == id)
    check_quest = quest_query.first()

    if not check_quest:
        raise HTTPException(status_code=404, detail="Quest doesn't exist")

    quest_query.update({'is_activated': not check_quest.is_activated}, synchronize_session=False)

    db.commit()
    db.refresh(check_quest)

    return {'status': 'OK'}

# DELETE

@router.delete('/delete/{url}')
def delete_quest(url: str, db: Session = Depends(get_db)):
    quest_query = db.query(Quest).filter(Quest.url == url)
    check_quest = quest_query.first()

    if not check_quest:
        raise HTTPException(status_code=404, detail="Quest doesn't exist")

    if check_quest.photo:
        key = check_quest.photo.replace(settings.S3_FULL_URL,'')
        s3.delete_photo(key)

    for elem in check_quest.quest_lines:
        if elem.photo:
            key = elem.photo.replace(settings.S3_FULL_URL,'')
            s3.delete_photo(key)

    quest_query.delete(synchronize_session=False)
    db.commit()
    
    return {'status': 'OK'}

# QUEST ACTIVATION

# CREATE

@router.post('/activation/create', status_code=status.HTTP_201_CREATED)
def create_quest_activation(payload: quest_scheme.QuestActivationSendScheme, db: Session = Depends(get_db)):
    new_activation_request = QuestActivationRequest(**payload.dict())
    db.add(new_activation_request)
    db.commit()
    db.refresh(new_activation_request)

    return {'status': 'OK'}

# READ

@router.get('/activation/all', response_model=List[quest_scheme.QuestActivationResponseScheme])
def get_all_activation_requests(db: Session = Depends(get_db)):
    requests = db.query(QuestActivationRequest).all()
    return requests

@router.get('/activation/{quest_id}')
def get_if_quest_is_pending(quest_id: str, db: Session = Depends(get_db)):
    quest = db.query(QuestActivationRequest).filter(QuestActivationRequest.quest_id == quest_id).first()
    if quest:
        return {'status': True}
    return {'status': False}

# DELETE

@router.delete('/activation/delete/{id}')
def delete_activation_request(id: str, db: Session = Depends(get_db)):

    check_request = db.query(QuestActivationRequest).filter(QuestActivationRequest.id == id).first()
    
    if not check_request:
        raise HTTPException(status_code=404, detail="Activation request dosen't exists")

    db.delete(check_request)
    db.commit()

    return {'status': 'OK'}

# LINES

# CREATE

@router.post('/lines/create/{url}', status_code=status.HTTP_201_CREATED)
def create_quest_line(url: str, payload: quest_scheme.QuestLineSendScheme, db: Session = Depends(get_db)):

    check_quest = db.query(Quest).filter(Quest.url == url).first()
    if not check_quest:
        raise HTTPException(status_code=404, detail="Quest doesn't exist")
    check_unique_number = db.query(QuestLine).filter(QuestLine.quest_id == check_quest.id, QuestLine.unique_number == payload.unique_number).first()
    if check_unique_number:
        raise HTTPException(status_code=403, detail='Quest line with this unique number already exists')

    payload_options = payload.quest_current_options
    del payload.quest_current_options

    new_quest_line = QuestLine(quest_id=check_quest.id, **payload.dict())
    db.add(new_quest_line)
    db.commit()
    db.refresh(new_quest_line)

    for elem in payload_options:
        option = QuestOption(name=elem.name, quest_current_line_id=new_quest_line.id, quest_next_line_id=elem.quest_next_line_id)
        db.add(option)
        db.commit()
        db.refresh(option)

    return {'status': 'OK', 'id': new_quest_line.id}

# READ

@router.get('/lines/all/{url}', response_model=List[quest_scheme.QuestLineResponseScheme])
def get_all_lines_for_quest(url: str, db: Session = Depends(get_db)):
    check_quest = db.query(Quest).filter(Quest.url == url).first()
    if not check_quest:
        raise HTTPException(status_code=404, detail="Quest doesn't exist")

    return check_quest.quest_lines

@router.get('/lines/{url}/{unique_number}', response_model=quest_scheme.QuestLineResponseScheme)
def get_line_for_quest(url: str, unique_number: int, db: Session = Depends(get_db)):
    check_quest = db.query(Quest).filter(Quest.url == url).first()
    if not check_quest:
        raise HTTPException(status_code=404, detail="Quest doesn't exist")

    check_quest_line = db.query(QuestLine).filter(QuestLine.quest_id == check_quest.id, QuestLine.unique_number == unique_number).first()
    if not check_quest_line:
        raise HTTPException(status_code=404, detail="Quest Line doesn't exist")

    return check_quest_line

# UPDATE

@router.patch('/lines/update/{id}')
def update_quest_line(id: str, payload: quest_scheme.QuestLineSendScheme, db: Session = Depends(get_db)):

    quest_line_query = db.query(QuestLine).filter(QuestLine.id == id)
    check_quest_line = quest_line_query.first()

    if not check_quest_line:
        raise HTTPException(status_code=404, detail="Quest Line doesn't exist")

    check_quest_line_unumber = db.query(QuestLine).filter(QuestLine.unique_number == payload.unique_number, QuestLine.quest_id == check_quest_line.quest_id).first()

    if check_quest_line_unumber and str(check_quest_line_unumber.id) != id:
        raise HTTPException(status_code=403, detail='Quest with this unique number already exists')

    payload_options = payload.quest_current_options
    del payload.quest_current_options

    update_data = payload.dict(exclude_unset=True)

    quest_line_query.update(update_data, synchronize_session=False)
    db.commit()
    db.refresh(check_quest_line)

    db.query(QuestOption).filter(QuestOption.quest_current_line_id == id).delete()
    db.commit()

    for elem in payload_options:
        option = QuestOption(name=elem.name, quest_current_line_id=id, quest_next_line_id=elem.quest_next_line_id)
        db.add(option)
        db.commit()
        db.refresh(option)

    return {'status': 'OK', 'unique_number': check_quest_line.unique_number}

# DELETE

@router.delete('/lines/delete/{id}')
def delete_quest_line(id: str, db: Session = Depends(get_db)):

    check_quest_line = db.query(QuestLine).filter(QuestLine.id == id).first()
    
    if not check_quest_line:
        raise HTTPException(status_code=404, detail="Quest Line doesn't exist")

    if check_quest_line.photo:
        key = check_quest_line.photo.replace(settings.S3_FULL_URL,'')
        s3.delete_photo(key)

    db.delete(check_quest_line)
    db.commit()

    return {'status': 'OK'}

# S3

# BASE QUEST

@router.patch('/update/photo/{id}')
def update_quest_photo(id: str, photo: UploadFile, db: Session = Depends(get_db)):

    quest_query = db.query(Quest).filter(Quest.id == id)
    check_quest = quest_query.first()

    if not check_quest:
        raise HTTPException(status_code=404, detail="Quest doesn't exist")
    
    key = FOLDER_QUEST + id + photo.filename

    if check_quest.photo:
        old_key = check_quest.photo.replace(settings.S3_FULL_URL,'')
        s3.delete_photo(old_key)
    
    s3.add_new_photo(photo.file, key)

    quest_query.update({'photo': f'{settings.S3_FULL_URL + key}'}, synchronize_session=False)
    db.commit()
    db.refresh(check_quest)

    return {'status': 'OK'}

@router.delete('/delete/photo/{id}')
def delete_quest_photo(id: str, db: Session = Depends(get_db)):

    quest_query = db.query(Quest).filter(Quest.id == id)
    check_quest = quest_query.first()

    if not check_quest:
        raise HTTPException(status_code=404, detail="Quest doesn't exist")

    key = check_quest.photo.replace(settings.S3_FULL_URL,'')
    s3.delete_photo(key)

    quest_query.update({'photo': ''}, synchronize_session=False)
    db.commit()
    db.refresh(check_quest)

    return {'status': 'OK'}

# LINES

@router.patch('/lines/update/photo/{id}')
def update_quest_line_photo(id: str, photo: UploadFile, db: Session = Depends(get_db)):

    quest_line_query = db.query(QuestLine).filter(QuestLine.id == id)
    check_quest_line = quest_line_query.first()

    if not check_quest_line:
        raise HTTPException(status_code=404, detail="Quest doesn't exist")
    
    key = FOLDER_QUESTLINE + id + photo.filename

    if check_quest_line.photo:
        old_key = check_quest_line.photo.replace(settings.S3_FULL_URL,'')
        s3.delete_photo(old_key)
    
    s3.add_new_photo(photo.file, key)

    quest_line_query.update({'photo': f'{settings.S3_FULL_URL + key}'}, synchronize_session=False)
    db.commit()
    db.refresh(check_quest_line)

    return {'status': 'OK'}

@router.delete('/lines/delete/photo/{id}')
def delete_quest_line_photo(id: str, db: Session = Depends(get_db)):

    quest_line_query = db.query(QuestLine).filter(QuestLine.id == id)
    check_quest_line = quest_line_query.first()

    if not check_quest_line:
        raise HTTPException(status_code=404, detail="Quest doesn't exist")

    key = check_quest_line.photo.replace(settings.S3_FULL_URL,'')
    s3.delete_photo(key)

    quest_line_query.update({'photo': ''}, synchronize_session=False)
    db.commit()
    db.refresh(check_quest_line)

    return {'status': 'OK'}
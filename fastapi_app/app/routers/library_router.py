from fastapi import (
    APIRouter, 
    Depends,
    status,
    HTTPException
)
from sqlalchemy.orm import Session, joinedload
from typing import List
from ..database import get_db
from ..models import LibraryRecord, LibraryTag
from ..schemes import library_scheme
from ..oauth2 import require_user

router = APIRouter()

@router.get("/records/all", response_model=List[library_scheme.LibraryRecordResponseScheme])
def get_records(db: Session = Depends(get_db)):
    records = db.query(LibraryRecord).options(joinedload(LibraryRecord.library_tags)).all()
    return records

@router.get("/records/{url}", response_model=library_scheme.LibraryRecordResponseScheme)
def get_record(url: str, db: Session = Depends(get_db)):
    record = db.query(LibraryRecord).options(joinedload(LibraryRecord.library_tags)).filter(LibraryRecord.url == url).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record doesn't exist")
    
    return record

@router.post('/records/create')
def create_record(payload: library_scheme.LibraryRecordResponseScheme, db: Session = Depends(get_db)):

    check_record = db.query(LibraryRecord).filter(LibraryRecord.url == payload.url).first()
    if check_record:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Record with this url already exists')

    tags = db.query(LibraryTag).all()
    tags_names = [x.name for x in tags]

    payload_temp = []
    for elem in payload.library_tags:
        if elem.name not in tags_names:
            payload_temp.append(LibraryTag(name=elem.name))
        else:
            tag = db.query(LibraryTag).filter(LibraryTag.name==elem.name).first()
            payload_temp.append(tag)

    payload.library_tags = payload_temp

    new_library_record = LibraryRecord(**payload.dict())
    
    db.add(new_library_record)
    db.commit()
    db.refresh(new_library_record)

    return {'status': 'success', 'message': 'OK'}

@router.patch('/records/update/{url}')
def update_record(url: str, payload: library_scheme.LibraryRecordResponseScheme, db: Session = Depends(get_db)):
    record_query = db.query(LibraryRecord).options(joinedload(LibraryRecord.library_tags)).filter(LibraryRecord.url == url)
    check_record = record_query.first()
    if not check_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record doesn't exist")

    check_record_url = db.query(LibraryRecord).filter(LibraryRecord.url == payload.url).first()

    if check_record_url and check_record_url.id != check_record.id:
         raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Record with this url already exists')

    tags = db.query(LibraryTag).all()
    tags_names = [x.name for x in tags]

    payload_temp = []
    for elem in payload.library_tags:
        if elem.name not in tags_names:
            payload_temp.append(LibraryTag(name=elem.name))
        else:
            tag = db.query(LibraryTag).filter(LibraryTag.name==elem.name).first()
            payload_temp.append(tag)

    del payload.library_tags

    update_data = payload.dict(exclude_unset=True)
    check_record.library_tags = payload_temp

    record_query.update(update_data, synchronize_session=False)
    db.commit()
    db.refresh(check_record)

    return {'status': 'success', 'message': 'OK'}

@router.delete('/records/delete/{url}')
def delete_quest(url: str, db: Session = Depends(get_db)):
    record_query = db.query(LibraryRecord).options(joinedload(LibraryRecord.library_tags)).filter(LibraryRecord.url == url)
    check_record = record_query.first()

    if not check_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record doesn't exist")

    check_record.library_tags = []
    db.commit()
        
    record_query.delete(synchronize_session=False)
    db.commit()
    return {'success': 'OK'}

@router.get("/tags/all", response_model=List[library_scheme.LibraryTagResponseScheme])
def get_tags(db: Session = Depends(get_db)):
    tags = db.query(LibraryTag).options(joinedload(LibraryTag.library_records)).all()
    return tags

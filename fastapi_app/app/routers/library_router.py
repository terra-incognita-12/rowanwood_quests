from fastapi import (
    APIRouter,
    Depends,
    status,
    HTTPException,
    UploadFile,
    Form
)
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import asc
from typing import List
from ..s3 import s3
from ..database import get_db
from ..config import settings
from ..models import LibraryRecord, LibraryTag
from ..schemes import library_scheme
from ..oauth2 import require_editor

router = APIRouter()

FOLDER = 'record/'

# RECORDS

# CREATE

# role: editor,admin
@router.post('/records/create')
def create_record(payload: library_scheme.LibraryRecordSendScheme, db: Session = Depends(get_db), user_id: str = Depends(require_editor)):

    check_record = db.query(LibraryRecord).filter(LibraryRecord.url == payload.url).first()
    if check_record:
        raise HTTPException(status_code=403, detail='Record with this url already exists')

    payload.library_tags = prepare_library_tags(payload.library_tags, db)

    payload.name = payload.name.capitalize()

    new_library_record = LibraryRecord(**payload.dict())
    
    db.add(new_library_record)
    db.commit()
    db.refresh(new_library_record)

    return {'status': 'OK', 'id': new_library_record.id}

# READ

@router.get("/records/all", response_model=List[library_scheme.LibraryRecordResponseSchemePreview])
def get_records(db: Session = Depends(get_db)):
    records = db.query(LibraryRecord).order_by(asc(LibraryRecord.name)).all()
    return records

@router.get("/records/{url}", response_model=library_scheme.LibraryRecordResponseScheme)
def get_record(url: str, db: Session = Depends(get_db)):
    if not url or url == "undefined":
        raise HTTPException(status_code=404, detail="Enter Correct Record")
        
    record = db.query(LibraryRecord).filter(LibraryRecord.url == url).first()

    if not record:
        raise HTTPException(status_code=404, detail="Record doesn't exist")
    
    return record

# get records by tag
@router.get("/records/tag/{tag}", response_model=List[library_scheme.LibraryRecordBaseScheme])
def get_records_by_tag(tag: str, db: Session = Depends(get_db)):
    tags = db.query(LibraryTag).filter(LibraryTag.name == tag).first()
    if not tags:
        raise HTTPException(status_code=404, detail="Record or tag doesn't exist")

    records = [x.library_records for x in tags]

    return records[0]

# UPDATE

# role: editor,admin
@router.patch('/records/update/{id}')
def update_record(id: str, payload: library_scheme.LibraryRecordSendScheme, db: Session = Depends(get_db), user_id: str = Depends(require_editor)):
    record_query = db.query(LibraryRecord).filter(LibraryRecord.id == id)
    check_record = record_query.first()
    if not check_record:
        raise HTTPException(status_code=404, detail="Record doesn't exist")

    check_record_url = db.query(LibraryRecord).filter(LibraryRecord.url == payload.url).first()

    if check_record_url and str(check_record_url.id) != id:
         raise HTTPException(status_code=403, detail='Record with this url already exists')

    payload_temp = prepare_library_tags(payload.library_tags, db)
    del payload.library_tags

    payload.name = payload.name.capitalize()

    update_data = payload.dict(exclude_unset=True)
    check_record.library_tags = payload_temp

    record_query.update(update_data, synchronize_session=False)
    db.commit()
    db.refresh(check_record)

    return {'status': 'OK'}

# DELETE

# role: editor,admin
@router.delete('/records/delete/{url}')
def delete_record(url: str, db: Session = Depends(get_db), user_id: str = Depends(require_editor)):
    record_query = db.query(LibraryRecord).filter(LibraryRecord.url == url)
    check_record = record_query.first()

    if not check_record:
        raise HTTPException(status_code=404, detail="Record doesn't exist")

    if check_record.photo:
        key = check_record.photo.replace(settings.S3_FULL_URL,'')
        s3.delete_photo(key)

    check_record.library_tags = []
    db.commit()
        
    record_query.delete(synchronize_session=False)
    db.commit()
    
    return {'status': 'OK'}

# TAGS

# READ

@router.get("/tags/all", response_model=List[library_scheme.LibraryTagResponseScheme])
def get_tags(db: Session = Depends(get_db)):
    tags = db.query(LibraryTag).order_by(asc(LibraryTag.name)).all()
    return tags

@router.get("/tags/{id}", response_model=library_scheme.LibraryTagResponseScheme)
def get_tag(id: str, db: Session = Depends(get_db)):
    if not id or id == "undefined":
        raise HTTPException(status_code=404, detail="Enter Correct Tag")
        
    tag = db.query(LibraryTag).filter(LibraryTag.id == id).first()
    
    if not tag:
        raise HTTPException(status_code=404, detail="Tag doesn't exist")
    
    return tag

# UPDATE

# role: editor,admin
@router.patch('/tags/update/{id}')
def update_tag(id: str, payload: library_scheme.LibraryTagSendScheme, db: Session = Depends(get_db), user_id: str = Depends(require_editor)):
    tag_query = db.query(LibraryTag).filter(LibraryTag.id == id)
    check_tag = tag_query.first()
    if not check_tag:
        raise HTTPException(status_code=404, detail="Tag doesn't exist")

    check_tag_name = db.query(LibraryTag).filter(LibraryTag.name == payload.name).first()

    if check_tag_name and str(check_tag_name.id) != id:
         raise HTTPException(status_code=403, detail='Tag with this name already exists')

    update_data = payload.dict(exclude_unset=True)

    tag_query.update(update_data, synchronize_session=False)
    db.commit()
    db.refresh(check_tag)

    return {'status': 'OK'}

# DELETE

# role: editor,admin
@router.delete('/tags/delete/{id}')
def delete_tag(id: str, db: Session = Depends(get_db), user_id: str = Depends(require_editor)):
    tag_query = db.query(LibraryTag).filter(LibraryTag.id == id)
    check_tag = tag_query.first()
    if not check_tag:
        raise HTTPException(status_code=404, detail="Tag doesn't exist")

    check_tag.library_records = []
    db.commit()
        
    tag_query.delete(synchronize_session=False)
    db.commit()
    
    return {'status': 'OK'}

# S3

# role: editor,admin
@router.patch('/records/update/photo/{id}')
def update_record_photo(id: str, photo: UploadFile, db: Session = Depends(get_db), user_id: str = Depends(require_editor)):
    record_query = db.query(LibraryRecord).filter(LibraryRecord.id == id)
    check_record = record_query.first()
    if not check_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record doesn't exist")

    key = FOLDER + id + photo.filename

    if check_record.photo:
        old_key = check_record.photo.replace(settings.S3_FULL_URL,'')
        s3.delete_photo(old_key)
    
    s3.add_new_photo(photo.file, key)

    record_query.update({'photo': f'{settings.S3_FULL_URL + key}'}, synchronize_session=False)
    db.commit()
    db.refresh(check_record)

    return {'status': 'OK'}

# role: editor,admin
@router.delete('/records/delete/photo/{id}')
def delete_record_photo(id: str, db: Session = Depends(get_db), user_id: str = Depends(require_editor)):
    record_query = db.query(LibraryRecord).filter(LibraryRecord.id == id)
    check_record = record_query.first()
    if not check_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record doesn't exist")

    key = check_record.photo.replace(settings.S3_FULL_URL,'')
    s3.delete_photo(key)

    record_query.update({'photo': ''}, synchronize_session=False)
    db.commit()
    db.refresh(check_record)

    return {'status': 'OK'}

# MISC

def prepare_library_tags(payload_tags: List, db: Session):
    payload_temp = []

    all_tags = db.query(LibraryTag.name).all()
    all_tags_names = [x[0] for x in all_tags]
    
    for elem in payload_tags:
        if elem.name not in all_tags_names:
            payload_temp.append(LibraryTag(name=elem.name))
        else:
            tag = db.query(LibraryTag).filter(LibraryTag.name==elem.name).first()
            payload_temp.append(tag)

    return payload_temp

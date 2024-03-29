import uuid
from fastapi import (
    APIRouter, 
    Depends,
    status
)
from fastapi.exceptions import HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Comment, Quest, User
from ..schemes import comment_scheme
from ..oauth2 import require_user

router = APIRouter()

# role: user,editor,admin
@router.post('/create')
def create_comment(payload: comment_scheme.CreateCommentScheme, db: Session = Depends(get_db), user_id: str = Depends(require_user)):
    quest = db.query(Quest).filter(Quest.url == payload.quest_url).first()
    if not quest:
        raise HTTPException(status_code=404, detail="Quest doesn't exist")

    new_comment = Comment(
        text_comment=payload.text_comment,
        user_id=uuid.UUID(user_id),
        quest_id=quest.id
    )

    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)

    return {'status': 'OK'}

# role: user,editor,admin
@router.post('/delete')
def delete_comment(payload: comment_scheme.DeleteCommentScheme, db: Session = Depends(get_db), user_id: str = Depends(require_user)):
    comment = db.query(Comment).filter(Comment.id == payload.id).first()

    if not comment:
        raise HTTPException(status_code=404, detail="Comment doesn't exist")

    db.delete(comment)
    db.commit()

    return {'status': 'OK'}
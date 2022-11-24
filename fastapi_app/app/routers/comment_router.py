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
from ..models import Comment, Quest
from ..schemes import comment_scheme
from ..oauth2 import require_user

router = APIRouter()

@router.post('/create', status_code=status.HTTP_201_CREATED)
def create_comment(payload: comment_scheme.CreateCommentScheme, db: Session = Depends(get_db), user_id: str = Depends(require_user)):
    payload.user_id = uuid.UUID(user_id)

    quest = db.query(Quest).filter(Quest.url == payload.quest_url).first()
    if not quest:
        raise HTTPException(status_code=404, detail="Quest doesn't exist")

    new_comment = Comment(
        text_comment=payload.text_comment,
        user_id=payload.user_id,
        quest_id=quest.id
    )

    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)

    return {'status': 'success', 'message': 'Comment created succesfully'}

@router.post('/delete', status_code=status.HTTP_200_OK)
def delete_comment(payload: comment_scheme.DeleteCommentScheme, db: Session = Depends(get_db), user_id: str = Depends(require_user)):
    comment = db.query(Comment).filter(Comment.id == payload.id).first()

    if not comment:
        raise HTTPException(status_code=404, detail="Comment doesn't exist")

    db.delete(comment)
    db.commit()

    return {'status', 'ok'}
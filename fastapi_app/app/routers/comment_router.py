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

    print(payload)

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

# @router.get('/all', response_model=List[comment_scheme.CommentResponseScheme])
# def get_all_comments(db: Session = Depends(get_db)):
#    comments = db.query(Comment).all()
#    return comments

# @router.get('/{url}', response_model=quest_scheme.QuestResponseScheme)
# def get_quest(url: str, db: Session = Depends(get_db)):
#    quest = db.query(Quest).filter(Quest.url == url).first()
#    if not quest:
#        raise HTTPException(status_code=404, detail="Quest doesn't exist")
#    return quest
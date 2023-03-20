from fastapi import APIRouter

from . import (
	auth_router, 
	user_router, 
	quest_router, 
	comment_router,
	library_router
)

api_router = APIRouter()

api_router.include_router(auth_router.router, prefix='/auth', tags=['Auth'])
api_router.include_router(user_router.router, prefix='/user', tags=['User'])
api_router.include_router(quest_router.router, prefix='/quest', tags=['Quest'])
api_router.include_router(comment_router.router, prefix='/comment', tags=['Comment'])
api_router.include_router(library_router.router, prefix='/library', tags=['Library'])
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers.base_router import api_router
from app.config import settings

Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = [
    f'{settings.HOST_FRONTEND}'
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)

app.include_router(api_router)

@app.get("/")
def read_root():
    return {"Hello": "World"}
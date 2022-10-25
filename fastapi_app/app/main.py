from fastapi import FastAPI

from database import Base, engine
from routers.base_router import api_router

Base.metadata.create_all(bind=engine)

app = FastAPI()
app.include_router(api_router)

@app.get("/")
def read_root():
    return {"Hello": "World"}
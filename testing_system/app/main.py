from fastapi import FastAPI
from os import getenv
from api import session

app = FastAPI(
    debug=bool(int(getenv("DEBUG", "0")))
)

app = FastAPI()

app.include_router(session.router, prefix="/api", tags=["upload"])
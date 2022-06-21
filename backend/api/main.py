import os
import dotenv

dotenv.load_dotenv()
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import api


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:19006", "https://djusdnet.uw.r.appspot.com", "https://ucdhunt.calvin.laurenson.dev"],
    allow_methods=["GET", "POST"],
    allow_credentials=True,
    allow_headers=["*"],
)
app.include_router(api.router, prefix="/api")

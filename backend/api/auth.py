import os
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from sqlmodel import Session, select

from .model import Team
from .db import engine

security = HTTPBasic()

def get_user(creds: HTTPBasicCredentials = Depends(security)):
    with Session(engine) as session:
        team = session.exec(select(Team).where(Team.number == int(creds.username))).first()
        if team is None:
            raise HTTPException(status_code=401, detail="Team not found")
        # if team.password != creds.password:
        #     raise HTTPException(status_code=401, detail="Invalid password")
        return team
def use_admin(creds: HTTPBasicCredentials = Depends(security)):
    if creds.username != "admin":
        raise HTTPException(status_code=401, detail="Admin only")
    if creds.password != os.environ["ADMIN_PASSWORD"]:
        raise HTTPException(status_code=401, detail="Invalid password")
    return True

from enum import IntEnum
from pydantic import validator
from sqlalchemy import Column, LargeBinary
from sqlmodel import Relationship, SQLModel, Field
import uuid as uuid_lib
from datetime import datetime
import arrow
from sqlalchemy_utils.types.arrow import ArrowType

class SubmissionStatus(IntEnum):
    WAITING = 0
    RECEIVED = 1
    REJECTED = 2
    APPROVED = 3

class Team(SQLModel, table=True):
    id: uuid_lib.UUID = Field(
        default_factory=uuid_lib.uuid4,
        primary_key=True,
        index=True,
        nullable=False,
    )
    members: list[str] = Field(default_factory=list, nullable=False)
    name: str = Field(nullable=False)
    number: int = Field(nullable=False, index=True)
    submissions: list["Submission"] = Relationship(back_populates="team")
    password: str = Field(nullable=False)


class Submission(SQLModel, table=True):
    id: uuid_lib.UUID = Field(
        default_factory=uuid_lib.uuid4,
        primary_key=True,
        index=True,
        nullable=False,
    )
    team_id: uuid_lib.UUID = Field(foreign_key="team.id", nullable=False)
    team: Team = Relationship(back_populates="submissions")
    tile_id: uuid_lib.UUID = Field(foreign_key="tile.id", nullable=False)
    tile: "Tile" = Relationship(back_populates="submissions")
    status: SubmissionStatus = Field(nullable=False, default=SubmissionStatus.WAITING)
    image_id: str = Field(default=None, nullable=False)
    created_at: arrow.Arrow = Field(default_factory=arrow.utcnow, nullable=False, sa_column=Column(ArrowType))

    class Config:
        arbitrary_types_allowed = True

    @validator("created_at")
    def format_datetime(cls, value):
        return value._datetime


class Tile(SQLModel, table=True):
    id: uuid_lib.UUID = Field(
        default_factory=uuid_lib.uuid4,
        primary_key=True,
        index=True,
        nullable=False,
    )
    col: int = Field(nullable=False, index=True)
    row: int = Field(nullable=False, index=True)
    submissions: list["Submission"] = Relationship(back_populates="tile")
    description: str = Field(nullable=False)
    disabled: bool = Field(nullable=False, default=False)
    default_value: bool = Field(nullable=False, default=False)
    img_link: str | None = Field(nullable=True, default=None)

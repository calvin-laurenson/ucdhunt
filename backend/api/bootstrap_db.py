from faker import Faker
from sqlmodel import SQLModel, Session, select
from model import Tile, Team
from db import engine

SQLModel.metadata.create_all(engine)

tiles = [
    {"col": 0, "row": 0, "description": "See No Evil/Hear No Evil"},
    {"col": 1, "row": 0, "description": "Telephone Booth"},
    {"col": 2, "row": 0, "description": "Shovel Arch"},
    {"col": 3, "row": 0, "description": "Shale hands with a student"},
    {"col": 4, "row": 0, "description": "Bookstore"},
    {"col": 0, "row": 1, "description": "Double-decker"},
    {"col": 1, "row": 1, "description": "Deathstar"},
    {"col": 2, "row": 1, "description": "The Arc"},
    {"col": 3, "row": 1, "description": "Yin & Yang"},
    {"col": 4, "row": 1, "description": "Bohart Museum"},
    {"col": 0, "row": 2, "description": "Bike Barn"},
    {"col": 1, "row": 2, "description": "Mondavi Center"},
    {
        "col": 2,
        "row": 2,
        "description": "FREE SPACE",
        "default_value": True,
        "disabled": True,
    },
    {"col": 3, "row": 2, "description": "UCD Sign"},
    {"col": 4, "row": 2, "description": "Schaal"},
    {
        "col": 0,
        "row": 3,
        "description": "Shields Library",
    },
    {"col": 1, "row": 3, "description": "Bookhead"},
    {"col": 2, "row": 3, "description": "Water Tower"},
    {"col": 3, "row": 3, "description": "Tennis Center"},
    {"col": 4, "row": 3, "description": "Ducks in the Arboretum"},
    {"col": 0, "row": 4, "description": "Dairy Recreation Outdoor Complex"},
    {"col": 1, "row": 4, "description": "Craft Center"},
    {"col": 2, "row": 4, "description": "Stargazer"},
    {"col": 3, "row": 4, "description": "Jungerman Hall"},
    {"col": 4, "row": 4, "description": "Eye on Mrak"},
]
assert len(tiles) == 25

fake = Faker()

with Session(engine) as session:
    if len(session.exec(select(Tile)).all()) == 0:
        session.add_all([Tile(**tile) for tile in tiles])

    if len(session.exec(select(Team)).all()) == 0:
        session.add_all(
            [
                Team(
                    name=f"Team {i}",
                    number=i,
                    password=fake.password(
                        length=8, special_chars=False, digits=False, upper_case=False
                    ),
                )
                for i in range(1, 25 + 1)
            ]
        )
    session.commit()

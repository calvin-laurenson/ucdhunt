from io import BytesIO
import os
from uuid import uuid4
import uuid
from base64 import b64encode
from fastapi import APIRouter, Body, Depends, File, Form
from sqlmodel import Session, select
from api.auth import get_user, use_admin

from api.cloudflare import get_dcu_link, get_image_info, make_image_url
from ..db import engine
from ..model import Submission, SubmissionStatus, Team, Tile

router = APIRouter()


@router.get("/tiles")
def get_tiles():
    with Session(engine) as session:
        tiles = session.exec(select(Tile).order_by(Tile.number)).all()
        return tiles


@router.get("/team-tiles")
def get_team_tiles(team: Team = Depends(get_user)):
    team_tiles = []
    with Session(engine) as session:
        tiles = session.exec(select(Tile)).all()
        submissions = session.exec(
            select(Submission).where(Submission.team_id == team.id)
        ).all()
    for tile in tiles:
        valid_submissions: list[Submission] = []
        for sub in submissions:
            if sub.tile_id == tile.id:
                valid_submissions.append(sub)
        valid_submissions.sort(key=lambda x: x.status, reverse=True)
        team_tile = {
            "id": tile.id,
            "col": tile.col,
            "row": tile.row,
            "description": tile.description,
            "disabled": tile.disabled,
            "img_link": tile.img_link,
        }
        if tile.default_value == True:
            team_tile["status"] = SubmissionStatus.APPROVED
        elif len(valid_submissions) > 0:
            team_tile["status"] = valid_submissions[0].status
        team_tiles.append(team_tile)
    return team_tiles


@router.get("/submission")
def get_submission(id: str):
    with Session(engine) as session:
        submission = session.exec(select(Submission).where(Submission.id == id)).first()
        if submission is None:
            return {"error": "Submission not found"}
        return {
            "image": submission.image_url,
            "status": submission.status,
        }


@router.post("/begin-submit")
def submit_tile(team: Team = Depends(get_user), tile_id: str = Body()):

    with Session(engine) as session:
        tile = session.exec(select(Tile).where(Tile.id == tile_id)).first()
        if tile is None:
            return {"error": "Tile not found"}
        # existing_submission = session.exec(
        #     select(Submission)
        #     .where(Submission.team_id == team.id)
        #     .where(Submission.tile_id == tile.id)
        # ).first()
        # if existing_submission is not None:
        #     return {"error": "Already submitted"}
        print(f"Tile id: {team.id}. Team id: {tile.id}")
        submission = Submission(team_id=team.id, tile_id=tile.id)
        upload_url, image_id = get_dcu_link({"submission_id": str(submission.id)})
        submission.image_id = image_id
        session.add(submission)
        session.commit()
        return {"upload_url": upload_url, "submission_id": str(submission.id)}


@router.post("/finish-submit")
def finish_submit(submission_id: str = Body()):
    with Session(engine) as session:
        submission = session.exec(
            select(Submission).where(Submission.id == submission_id)
        ).first()
        if submission is None:
            return {"error": "Submission not found"}
        image_info = get_image_info(submission.image_id)
        if image_info["draft"] == True:
            return {"error": "Image upload not complete"}
        if uuid.UUID(image_info["metadata"]["submission_id"]) != submission.id:
            return {"error": "Submission id mismatch"}
        submission.status = SubmissionStatus.RECEIVED
        session.commit()
    return {"error": None}


@router.get("/pending-submissions")
def get_pending_submissions(admin: bool = Depends(use_admin)):
    with Session(engine) as session:
        submissions = session.exec(
            select(Submission, Team).where(Submission.status == SubmissionStatus.RECEIVED)
            .join(Team)
            .order_by(Submission.created_at)
        ).all()
        pending_submissions = []
        for submission, team in submissions:
            pending_submissions.append({
                "id": submission.id,
                "team_number": team.number,
                "relative_time": submission.created_at.humanize()
            })
        return pending_submissions
@router.post("/review")
def review_submission(submission_id: str = Body(), approved: bool = Body(), admin: bool = Depends(use_admin)):
    with Session(engine) as session:
        submission = session.exec(
            select(Submission).where(Submission.id == submission_id)
        ).first()
        if submission is None:
            return {"error": "Submission not found"}
        if approved:
            submission.status = SubmissionStatus.APPROVED
        else:
            submission.status = SubmissionStatus.REJECTED
        session.commit()
        return {"error": None}


@router.post("/login")
def login(username: str = Body(), password: str = Body()):
    with Session(engine) as session:
        if username == "admin":
            print(password)
            print(os.environ["ADMIN_PASSWORD"])
            if password == os.environ["ADMIN_PASSWORD"]:
                return {"error": None}
            else:
                return {"error": "Incorrect password"}
        else:
            if not username.isdigit():
                return {"error": "Username must be a number"}
            team = session.exec(
                select(Team).where(Team.number == int(username))
            ).first()
            if team is None:
                return {"error": "Username not found"}
            # if team.password != password:
            #     return {"error": "Password incorrect"}
            return {"error": None}


@router.get("/leaderboard")
def get_leaderboard():
    with Session(engine) as session:
        teams = session.exec(select(Team)).all()
        default_tiles = session.exec(select(Tile).where(Tile.default_value == True)).all()
        team_scores: dict[int, int] = {}
        for team in teams:
            team_points = 0
            team_submissions = session.exec(
                select(Submission, Tile)
                .where(Submission.team_id == team.id)
                .where(Submission.status == SubmissionStatus.APPROVED)
                .join(Tile)
            ).all()
            board = [
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
            ]
            for default_tile in default_tiles:
                board[default_tile.row][default_tile.col] = 1
            for submission, tile in team_submissions:
                board[tile.row][tile.col] = 1
            # check for horizontal matches
            for row in board:
                if row == [1, 1, 1, 1, 1]:
                    team_points += 1
            # check for vertical matches
            for col in range(5):
                col_matches = 0
                for row in board:
                    if row[col] == 1:
                        col_matches += 1
                if col_matches == 5:
                    team_points += 1
            # check for left to right diagonal
            for row in range(5):
                if board[row][row] != 1:
                    break
                if row == 4:
                    team_points += 1
            # check for right to left diagonal
            for row in range(5):
                if board[row][4 - row] != 1:
                    break
                if row == 4:
                    team_points += 1
            team_scores[team.number] = team_points
        sorted_scores = sorted(team_scores.items(), key=lambda x: x[1], reverse=True)
        return [{"team_number": team_number, "score": score} for team_number, score in sorted_scores]
@router.get("/submission-details")
def get_submission_details(submission_id: str):
    with Session(engine) as session:
        submission, tile, team = session.exec(
            select(Submission, Tile, Team).where(Submission.id == submission_id).join(Tile).join(Team)
        ).first()
        if submission is None:
            return {"error": "Submission not found"}
        return {
            "team_number": team.number,
            "image": make_image_url(submission.image_id),
            "status": submission.status,
            "tile": {
                "row": tile.row,
                "col": tile.col,
                "description": tile.description
            }
        }

@router.get("/team-tile-submissions")
def get_team_tile_submissions(tile_id: str, team: Team = Depends(get_user)):
    with Session(engine) as session:
        tile = session.exec(
            select(Tile).where(Tile.id == tile_id)
        ).first()
        if tile is None:
            return {"error": "Tile not found"}
        submissions = session.exec(
            select(Submission, Team).where(Submission.tile_id == tile_id).where(Team.id == team.id).join(Team).order_by(Submission.created_at)
        ).all()
        return [
            {
                "status": submission.status,
                "relative_time": submission.created_at.humanize(),
            }
            for submission, team in submissions
        ]
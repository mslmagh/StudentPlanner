import json
import os
import random
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from crew import run_crew

load_dotenv()

app = FastAPI(title="Study Partner Crew API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:4173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load mock partners from the React project's data file
MOCK_PARTNERS_PATH = Path(__file__).parent.parent / "src" / "data" / "mockPartners.json"
with open(MOCK_PARTNERS_PATH, "r", encoding="utf-8") as f:
    ALL_PARTNERS = json.load(f)


class MatchRequest(BaseModel):
    course: str
    level: str
    preferredTime: str
    studyType: str


def find_best_candidate(request: MatchRequest) -> dict | None:
    """
    Find candidates from mock data. Same logic as frontend matching.js
    Falls back to same course only, then random if nothing matches.
    """
    time_order = ["Morning", "Afternoon", "Evening", "Night"]

    def similar_time(t1: str, t2: str) -> bool:
        try:
            return abs(time_order.index(t1) - time_order.index(t2)) <= 1
        except ValueError:
            return t1 == t2

    exact = [
        p for p in ALL_PARTNERS
        if p["course"].lower() == request.course.lower()
        and p["level"] == request.level
        and similar_time(request.preferredTime, p["time"])
    ]
    if exact:
        return random.choice(exact)

    course_match = [
        p for p in ALL_PARTNERS
        if p["course"].lower() == request.course.lower()
    ]
    if course_match:
        return random.choice(course_match)

    return random.choice(ALL_PARTNERS) if ALL_PARTNERS else None


@app.post("/api/match")
async def match_partner(request: MatchRequest):
    if not os.getenv("OPENAI_API_KEY"):
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY not set in .env")

    partner = find_best_candidate(request)
    if not partner:
        raise HTTPException(status_code=404, detail="No partners available in mock data")

    try:
        result = run_crew(
            course=request.course,
            level=request.level,
            preferred_time=request.preferredTime,
            study_type=request.studyType,
            partner=partner,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Crew execution failed: {str(e)}")

    return result


@app.get("/health")
def health():
    return {"status": "ok"}

import asyncio
import json
import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from crew import run_crew
from database import Base, SessionLocal, engine, Partner

Base.metadata.create_all(bind=engine)

load_dotenv()


def resolve_gemini_api_key() -> str | None:
    """Gemini anahtarını tek noktadan çözümle (GEMINI_API_KEY veya GOOGLE_API_KEY)."""
    return os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

app = FastAPI(title="Study Partner Crew API")

# CORS origins: geliştirme için localhost + üretimde FRONTEND_ORIGIN env var'ı
_origins = ["http://localhost:5173", "http://localhost:4173"]
_extra = os.getenv("FRONTEND_ORIGIN")
if _extra:
    _origins.append(_extra)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Seed database from mock file if empty
def seed_database_if_empty(db: Session):
    if db.query(Partner).first() is None:
        mock_path = Path(__file__).parent.parent / "src" / "data" / "mockPartners.json"
        if mock_path.exists():
            with open(mock_path, "r", encoding="utf-8") as f:
                partners_data = json.load(f)
                for p in partners_data:
                    # Ignore standard id if present
                    db.add(Partner(
                        name=p.get("name"),
                        course=p.get("course"),
                        level=p.get("level"),
                        time=p.get("time"),
                        studyType=p.get("studyType")
                    ))
            db.commit()

# On startup, seed DB
with SessionLocal() as db:
    seed_database_if_empty(db)

TIME_ORDER = ["Morning", "Afternoon", "Evening", "Night"]


class MatchRequest(BaseModel):
    course: str
    level: str
    preferredTime: str
    studyType: str


class AnalyzeCandidateRequest(MatchRequest):
    partnerId: int


def _partner_score(partner: dict, request: MatchRequest) -> int:
    """
    Puanlama mantığı:
      - Aynı ders:             +50
      - Aynı seviye:           +30
      - Zaman dilimi farkı 0:  +20  / fark 1: +10  / fark ≥ 2: +0
      - Aynı çalışma türü:     +10
    Maks: 110
    """
    score = 0
    if partner["course"].lower() == request.course.lower():
        score += 50
    if partner["level"] == request.level:
        score += 30
    try:
        gap = abs(TIME_ORDER.index(request.preferredTime) - TIME_ORDER.index(partner["time"]))
        score += max(0, 20 - gap * 10)
    except ValueError:
        pass
    if partner["studyType"] == request.studyType:
        score += 10
    return score


def find_exact_candidates(request: MatchRequest, db: Session) -> list[dict]:
    """Ders + seviye + zaman + çalışma türü birebir eşleşen tüm adayları döndür."""
    return [
        p.to_dict() for p in db.query(Partner).filter(
            Partner.course == request.course,
            Partner.level == request.level,
            Partner.time == request.preferredTime,
            Partner.studyType == request.studyType,
        ).all()
    ]


def to_candidate_payload(partners: list[dict], request: MatchRequest) -> list[dict]:
    payload: list[dict] = []
    for idx, partner in enumerate(partners, start=1):
        payload.append(
            {
                "rank": idx,
                "matched_partner": partner,
                "rule_score": _partner_score(partner, request),
                "ai_ready": False,
                "compatibility_score": None,
                "overall_score": None,
                "skill_analysis": "",
                "compatibility_raw": "",
                "study_plan": "",
                "evaluation_raw": "",
            }
        )
    return payload




# ─── Yeni akış: önce AI'sız aday listesi, sonra isteğe bağlı tekil analiz ───

@app.post("/api/match/candidates")
def list_candidates(request: MatchRequest, db: Session = Depends(get_db)):
    candidates = find_exact_candidates(request, db=db)
    if not candidates:
        raise HTTPException(status_code=404, detail="Bu kriterlere uygun partner bulunamadı")
    return to_candidate_payload(candidates, request)


@app.post("/api/match/analyze")
async def analyze_candidate(request: AnalyzeCandidateRequest, db: Session = Depends(get_db)):
    gemini_key = resolve_gemini_api_key()
    if not gemini_key:
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY (veya GOOGLE_API_KEY) .env içinde tanımlı değil",
        )

    os.environ.setdefault("GEMINI_API_KEY", gemini_key)
    os.environ.setdefault("GOOGLE_API_KEY", gemini_key)

    partner_row = (
        db.query(Partner)
        .filter(
            Partner.id == request.partnerId,
            Partner.course == request.course,
            Partner.level == request.level,
            Partner.time == request.preferredTime,
            Partner.studyType == request.studyType,
        )
        .first()
    )

    if partner_row is None:
        raise HTTPException(status_code=404, detail="Seçilen partner kriterlerle eşleşmiyor")

    try:
        result = await asyncio.to_thread(
            run_crew,
            course=request.course,
            level=request.level,
            preferred_time=request.preferredTime,
            study_type=request.studyType,
            partner=partner_row.to_dict(),
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    result["ai_ready"] = True
    return result


# ─── Geriye dönük uyumluluk için stream endpoint'i tutuldu ───

@app.post("/api/match/stream")
async def match_partner_stream(request: MatchRequest, db: Session = Depends(get_db)):
    gemini_key = resolve_gemini_api_key()
    if not gemini_key:
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY (veya GOOGLE_API_KEY) .env içinde tanımlı değil",
        )

    # CrewAI/LiteLLM farklı sağlayıcı isimlerini kullanabildiği için iki env'i de doldur.
    os.environ.setdefault("GEMINI_API_KEY", gemini_key)
    os.environ.setdefault("GOOGLE_API_KEY", gemini_key)

    candidates = find_exact_candidates(request, db=db)[:3]
    if not candidates:
        raise HTTPException(status_code=404, detail="No partners available in mock data")

    async def generate():
        for rank, partner in enumerate(candidates, start=1):
            # Her crew çağrısı blocking — thread pool'da çalıştır, event loop'u bloke etme
            try:
                result = await asyncio.to_thread(
                    run_crew,
                    course=request.course,
                    level=request.level,
                    preferred_time=request.preferredTime,
                    study_type=request.studyType,
                    partner=partner,
                )
                result["rank"] = rank
                payload = json.dumps(result, ensure_ascii=False)
            except Exception as e:
                payload = json.dumps({"error": str(e), "rank": rank}, ensure_ascii=False)

            yield f"data: {payload}\n\n"

        yield "data: [DONE]\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


@app.get("/health")
def health():
    return {"status": "ok"}

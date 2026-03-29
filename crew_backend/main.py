import asyncio
import json
import os
import random
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from crew import run_crew

load_dotenv()

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

# Load mock partners from the React project's data file
MOCK_PARTNERS_PATH = Path(__file__).parent.parent / "src" / "data" / "mockPartners.json"
with open(MOCK_PARTNERS_PATH, "r", encoding="utf-8") as f:
    ALL_PARTNERS = json.load(f)

TIME_ORDER = ["Morning", "Afternoon", "Evening", "Night"]


class MatchRequest(BaseModel):
    course: str
    level: str
    preferredTime: str
    studyType: str


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


def find_top_candidates(request: MatchRequest, n: int = 3) -> list[dict]:
    """
    Tüm partnerleri puanla, en yüksek n tanesini döndür.
    Aynı puana sahip adaylar arasında rastgele seçim yapılır (tekrarlı çalıştırmalarda çeşitlilik sağlar).
    """
    scored = [(partner, _partner_score(partner, request)) for partner in ALL_PARTNERS]
    scored.sort(key=lambda x: x[1], reverse=True)

    # Aynı puan grubu içinde karıştır — her seferinde farklı sıra
    result: list[dict] = []
    i = 0
    while i < int(len(scored)) and len(result) < n:
        same_score = [p for p, s in scored[i:] if s == scored[i][1]]
        random.shuffle(same_score)
        for p in same_score:
            result.append(p)
            if len(result) == n:
                break
        i += int(len(same_score))

    # Yeterli partner yoksa rastgele tamamla
    if not result:
        result = random.sample(ALL_PARTNERS, min(n, len(ALL_PARTNERS)))

    return result[:n]




# ─── Yeni streaming endpoint — top-3 SSE ───
@app.post("/api/match/stream")
async def match_partner_stream(request: MatchRequest):
    if not os.getenv("OPENAI_API_KEY"):
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY not set in .env")

    candidates = find_top_candidates(request, n=3)
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

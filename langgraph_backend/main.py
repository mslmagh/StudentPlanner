"""
LangGraph Backend - FastAPI Server
===================================
Kursta (ed-donner/agents/4_langgraph/app.py) Gradio UI kullanılıyordu.
Biz React frontend kullandığımız için FastAPI ile REST endpoint oluşturuyoruz.

Endpoint'ler:
  POST /api/assistant/chat   — Asistana mesaj gönder (thread_id ile geçmiş korunur)
  POST /api/assistant/reset  — Yeni session başlat
  GET  /health               — Sağlık kontrolü

Bu sunucu port 8001'de çalışır (crew_backend port 8000'de).
"""

import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from agent import StudyAssistant

load_dotenv()

app = FastAPI(title="LangGraph Study Assistant API")

# CORS
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


# ─── LLM env var yapılandırması ──────────────────────────────────────────────
def configure_llm_env() -> None:
    """OpenRouter veya Gemini anahtarlarını ayarla."""
    openrouter_key = os.getenv("OPENROUTER_API_KEY")
    if openrouter_key:
        os.environ["OPENROUTER_API_KEY"] = openrouter_key
        os.environ["OPENAI_API_KEY"] = openrouter_key
        os.environ.setdefault("OPENAI_API_BASE", "https://openrouter.ai/api/v1")
        return

    gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if gemini_key:
        os.environ["GEMINI_API_KEY"] = gemini_key
        os.environ["GOOGLE_API_KEY"] = gemini_key
        return

    raise HTTPException(
        status_code=500,
        detail="API anahtarı bulunamadı. OPENROUTER_API_KEY veya GEMINI_API_KEY tanımlı olmalı.",
    )


# ─── Global asistan (kursta: sidekick = gr.State()) ──────────────────────────
_assistant: StudyAssistant | None = None


def _get_assistant() -> StudyAssistant:
    global _assistant
    if _assistant is None:
        configure_llm_env()
        _assistant = StudyAssistant()
    return _assistant


# ─── Request modelleri ────────────────────────────────────────────────────────
class ChatRequest(BaseModel):
    message: str
    thread_id: str | None = None


# ─── Endpoint'ler ─────────────────────────────────────────────────────────────

@app.post("/api/assistant/chat")
async def assistant_chat(req: ChatRequest):
    """
    LangGraph asistanına mesaj gönder.
    Kursta process_message() → sidekick.run_superstep() çağrısının karşılığı.
    """
    try:
        assistant = _get_assistant()
        result = await assistant.chat(message=req.message, thread_id=req.thread_id)
        return result
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/api/assistant/reset")
async def assistant_reset():
    """
    Asistanı sıfırla.
    Kursta reset() → yeni Sidekick oluşturma.
    """
    global _assistant
    try:
        configure_llm_env()
        _assistant = StudyAssistant()
        return {"status": "ok", "thread_id": _assistant.session_id}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.get("/health")
def health():
    return {"status": "ok", "service": "langgraph"}

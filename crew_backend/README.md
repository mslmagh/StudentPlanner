---
title: Student Planner API
emoji: 🚀
colorFrom: pink
colorTo: blue
sdk: docker
pinned: false
---

# Study Partner CrewAI Backend

## Setup

1. Copy `.env.example` to `.env` and add your OpenRouter API key (or Gemini fallback key).
2. Install dependencies:

```bash
cd crew_backend
pip install -r requirements.txt
```

3. Run the development server:

```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/match/candidates` | List matching candidates (no AI, rule-based) |
| `POST` | `/api/match/analyze` | AI-analyze a specific candidate (CrewAI pipeline) |
| `POST` | `/api/match/stream` | Stream top matches as SSE (`data: {...}`) |
| `GET`  | `/health`    | Health check |

### POST `/api/match/stream` — Request Body

```json
{
  "course": "Mathematics",
  "level": "Intermediate",
  "preferredTime": "Morning",
  "studyType": "Group"
}
```

### POST `/api/match/stream` — Stream Event (`data:`)

```json
{
  "matched_partner": { "name": "...", "course": "...", "level": "...", "time": "...", "studyType": "..." },
  "skill_analysis": "...",
  "compatibility_raw": "Score: 85/100. ...",
  "compatibility_score": 85,
  "study_plan": "..."
}
```

## Agents

| Agent | Role |
|-------|------|
| `skill_analyzer` | Profiles the student's skill gaps and requirements |
| `compatibility_agent` | Scores partner compatibility (0–100) |
| `study_planner` | Builds a 1-week session-by-session study plan |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENROUTER_API_KEY` | Your OpenRouter API key (recommended) |
| `OPENROUTER_MODEL` | OpenRouter model id (optional, default: `deepseek/deepseek-v3.2`) |
| `GEMINI_API_KEY` | Gemini fallback key (optional) |
| `GOOGLE_API_KEY` | Alternative Gemini key name (optional) |
| `GEMINI_MODEL` | Gemini fallback model (optional) |

## Notes

- The backend now uses **`partners.db`** (SQLite) to safely parse the candidate pool profiles.
- CORS is pre-configured for `http://localhost:5173` (Vite dev server) and `http://localhost:4173` (Vite preview).
- The crew runs tasks **sequentially**: skill analysis → compatibility → study plan.

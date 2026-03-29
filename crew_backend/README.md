# Study Partner CrewAI Backend

## Setup

1. Copy `.env.example` to `.env` and add your OpenAI API key.
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
| `POST` | `/api/match` | Run the CrewAI pipeline and return match results |
| `GET`  | `/health`    | Health check |

### POST `/api/match` — Request Body

```json
{
  "course": "Mathematics",
  "level": "Intermediate",
  "preferredTime": "Morning",
  "studyType": "Group"
}
```

### POST `/api/match` — Response

```json
{
  "matched_partner": { "name": "...", "course": "...", "level": "...", "time": "...", "studyType": "..." },
  "skill_analysis": "...",
  "compatibility_raw": "Score: 85/100. ...",
  "compatibility_score": 85,
  "study_plan": "...",
  "evaluation_raw": "Overall Score: 90/100. ...",
  "overall_score": 90
}
```

## Agents

| Agent | Role |
|-------|------|
| `skill_analyzer` | Profiles the student's skill gaps and requirements |
| `compatibility_agent` | Scores partner compatibility (0–100) |
| `study_planner` | Builds a 1-week session-by-session study plan |
| `match_evaluator` | Final quality judge with overall score (0–100) |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | Your OpenAI API key (required) |

## Notes

- The backend reads `src/data/mockPartners.json` from the project root — keep paths intact.
- CORS is pre-configured for `http://localhost:5173` (Vite dev server) and `http://localhost:4173` (Vite preview).
- The crew runs tasks **sequentially**: skill analysis → compatibility → study plan → evaluation.

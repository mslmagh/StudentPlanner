# LangGraph Study Assistant Backend

LangGraph-based intelligent study assistant that helps students find study partners, explore courses, and get academic advice through a self-correcting graph workflow.

## Architecture

This backend implements the **Sidekick pattern** from the course (`ed-donner/agents/4_langgraph/sidekick.py`):

```
START ──► Worker ──► (tool_calls?) ──► Tools ──► Worker (loop)
                     (response)   ──► Evaluator
                                        │
                                  success? ──► END
                                  fail?    ──► Worker (retry)
                                  need_input? ──► END
```

### Nodes

| Node | Purpose |
|------|---------|
| **Worker** | LLM with tools bound — processes user queries, decides to call tools or respond |
| **Tools** | `ToolNode` — executes tool calls (database queries) and returns results to Worker |
| **Evaluator** | Validates response quality via structured output, sends feedback if insufficient |

### Key Components

| Component | File | Course Equivalent |
|-----------|------|-------------------|
| `State(TypedDict)` | `agent.py` | State definition with `add_messages` reducer |
| `StudyAssistant` | `agent.py` | `Sidekick` class from course |
| `EvaluatorOutput` | `agent.py` | Structured output for evaluation |
| `MemorySaver` | `agent.py` | Thread-based conversation checkpointer |
| Tools | `tools.py` | `sidekick_tools.py` from course |

## Setup

1. Install dependencies:

```bash
cd langgraph_backend
pip install -r requirements.txt
```

2. Configure environment:

```bash
cp .env.example .env
# Edit .env and add your API keys
```

3. Run the server:

```bash
uvicorn main:app --reload --port 8001
```

The API will be available at `http://localhost:8001`.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/assistant/chat` | Send message to LangGraph assistant |
| `POST` | `/api/assistant/reset` | Start new session (reset thread) |
| `GET`  | `/health` | Health check |

### POST `/api/assistant/chat` — Request

```json
{
  "message": "Matematik dersinde partner arıyorum",
  "thread_id": "optional-uuid"
}
```

### POST `/api/assistant/chat` — Response

```json
{
  "reply": "Matematik dersinde 5 partner bulundu...",
  "thread_id": "uuid-string",
  "success": true
}
```

## Tools

| Tool | Description |
|------|-------------|
| `search_partners` | Search partners by course, level, time, study type |
| `list_courses` | List all unique courses in the database |
| `get_partner_stats` | Get partner statistics for a specific course |

## LangSmith Integration

LangSmith provides full tracing of every graph step. Enable in `.env`:

```
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=lsv2_pt_your_key
LANGCHAIN_PROJECT=StudentPlanner-LangGraph
```

Dashboard: [smith.langchain.com](https://smith.langchain.com)

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENROUTER_API_KEY` | OpenRouter API key | Yes* |
| `OPENROUTER_MODEL` | Model ID (default: `deepseek/deepseek-chat`) | No |
| `GEMINI_API_KEY` | Google Gemini fallback key | Yes* |
| `LANGCHAIN_TRACING_V2` | Enable LangSmith (`true`) | No |
| `LANGCHAIN_API_KEY` | LangSmith API key | No |
| `LANGCHAIN_PROJECT` | LangSmith project name | No |
| `FRONTEND_ORIGIN` | Production frontend URL | No |

\* At least one of `OPENROUTER_API_KEY` or `GEMINI_API_KEY` is required.

## Notes

- Shares the same SQLite database (`partners.db`) with the CrewAI backend
- Runs on port 8001 (CrewAI backend runs on port 8000)
- CORS pre-configured for `http://localhost:5173` (Vite dev) and `http://localhost:4173` (Vite preview)

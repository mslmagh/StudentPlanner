# AI Study Partner Finder — StudentPlanner

An AI-powered education platform that helps students find compatible study partners using **two complementary AI systems**: **CrewAI** (multi-agent partner analysis) and **LangGraph** (intelligent study assistant with self-correcting graph-based workflow).

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend (Vite)                     │
│         http://localhost:5173  •  Vercel (production)        │
├──────────────────────────┬──────────────────────────────────┤
│   /api/match/*           │   /api/assistant/*               │
│        ↓                 │          ↓                       │
│  ┌──────────────┐        │   ┌───────────────────┐          │
│  │ CrewAI       │        │   │ LangGraph         │          │
│  │ Backend      │        │   │ Backend           │          │
│  │ Port 8000    │        │   │ Port 8001         │          │
│  │              │        │   │                   │          │
│  │ 3 Agents:    │        │   │ Graph Nodes:      │          │
│  │ • Skill      │        │   │ • Worker (LLM)    │          │
│  │   Analyzer   │        │   │ • Evaluator       │          │
│  │ • Compat.    │        │   │ • Tools           │          │
│  │   Agent      │  Shared│   │                   │          │
│  │ • Study      │   DB   │   │ Tools:            │          │
│  │   Planner    │◄──────►│   │ • search_partners │          │
│  └──────────────┘        │   │ • list_courses    │          │
│                          │   │ • get_partner_stats│         │
│                          │   └───────────────────┘          │
└──────────────────────────┴──────────────────────────────────┘
```

## ✨ Features

### CrewAI — Partner Matching Pipeline
- **Skill Analyzer Agent**: Profiles student skill gaps based on course, level, and study preferences
- **Compatibility Agent**: Scores partner compatibility (0–100) with detailed reasoning
- **Study Planner Agent**: Generates personalized 1-week study plans with 5 sessions
- Sequential pipeline: Skill Analysis → Compatibility → Study Plan

### LangGraph — Intelligent Study Assistant
- **Worker Node**: Processes user queries with tool access (database search, course listing, partner stats)
- **Evaluator Node**: Validates response quality using structured output, retries if insufficient
- **Self-Correction Loop**: Evaluator sends feedback back to Worker for improvement
- **MemorySaver**: Thread-based conversation history via LangGraph checkpointer
- **LangSmith Integration**: Full tracing and monitoring of graph execution steps

### Frontend (React + Vite)
- Study request creation with course, level, time, and study type selection
- Real-time AI partner matching with streaming results
- Interactive chat interface for LangGraph Study Assistant
- Active sessions management with messaging and calendar integration
- Dark/Light theme toggle
- Turkish localization (i18n)

## 📁 Project Structure

```text
StudentPlanner/
├── src/                          # React frontend
│   ├── pages/
│   │   ├── HomePage.jsx          # Landing page
│   │   ├── CreateRequestPage.jsx # Study request form
│   │   ├── MatchingPage.jsx      # AI partner matching (CrewAI)
│   │   ├── ActiveSessionsPage.jsx# Session management
│   │   ├── SessionRoomPage.jsx   # Live study room
│   │   └── StudyAssistantPage.jsx# LangGraph chat UI
│   ├── components/Navbar.jsx
│   ├── config.js                 # API base URLs
│   └── i18n.js                   # Turkish translations
│
├── crew_backend/                 # CrewAI Backend (port 8000)
│   ├── main.py                   # FastAPI server
│   ├── crew.py                   # Agent/Task/Crew definitions
│   ├── database.py               # SQLAlchemy models
│   ├── config/
│   │   ├── agents.yaml           # Agent roles & goals
│   │   └── tasks.yaml            # Task descriptions
│   └── requirements.txt
│
├── langgraph_backend/            # LangGraph Backend (port 8001)
│   ├── main.py                   # FastAPI server
│   ├── agent.py                  # StateGraph definition (Worker → Evaluator → Tools)
│   ├── tools.py                  # LangChain tool definitions
│   ├── database.py               # Shared database access
│   └── requirements.txt
│
├── vite.config.js                # Vite proxy (routes to both backends)
├── CrewAI_Report.md              # CrewAI implementation report
├── LangGraph_Report.md           # LangGraph implementation report
└── planning-document.md          # AI agent planning document
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+ and npm 9+
- Python 3.10+

### 1. Frontend

```bash
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

### 2. CrewAI Backend (port 8000)

```bash
cd crew_backend
pip install -r requirements.txt
cp .env.example .env    # Add your API keys
uvicorn main:app --reload --port 8000
```

### 3. LangGraph Backend (port 8001)

```bash
cd langgraph_backend
pip install -r requirements.txt
cp .env.example .env    # Add your API keys + LangSmith config
uvicorn main:app --reload --port 8001
```

### Environment Variables

| Variable | Description | Used By |
|----------|-------------|---------|
| `OPENROUTER_API_KEY` | OpenRouter API key (recommended) | Both backends |
| `OPENROUTER_MODEL` | Model ID (default: `deepseek/deepseek-chat`) | Both backends |
| `GEMINI_API_KEY` | Google Gemini fallback key | Both backends |
| `LANGCHAIN_TRACING_V2` | Enable LangSmith tracing (`true`) | LangGraph |
| `LANGCHAIN_API_KEY` | LangSmith API key | LangGraph |
| `LANGCHAIN_PROJECT` | LangSmith project name | LangGraph |

## 🔧 LangGraph — How It Works

The LangGraph Study Assistant follows the **Sidekick pattern** from the course (`ed-donner/agents/4_langgraph`):

```
START → Worker → (tool_calls?) → Tools → Worker (loop)
                  (no tools)  → Evaluator
                                    ↓
                          success? → END
                          fail?   → Worker (retry with feedback)
                          need_input? → END
```

1. **Worker** receives user message + system prompt, decides to use tools or respond directly
2. **Tools** execute database queries (search partners, list courses, get stats)
3. **Evaluator** validates the response quality using structured output (`EvaluatorOutput`)
4. If insufficient → feedback is sent back to Worker for self-correction
5. **MemorySaver** preserves conversation history across messages (thread-based)

## 📊 LangSmith Tracing

LangSmith provides full observability of every graph execution step:
- Worker LLM calls and token usage
- Tool invocations and results  
- Evaluator decisions and feedback
- End-to-end latency and cost tracking

Enable in `.env`:
```
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=lsv2_pt_your_key
LANGCHAIN_PROJECT=StudentPlanner-LangGraph
```

## 🔗 Links

- **GitHub**: https://github.com/mslmagh/StudentPlanner
- **Frontend (Vercel)**: https://student-planner-ruddy.vercel.app

## 📝 Reports

- [CrewAI Implementation Report](./CrewAI_Report.md)
- [LangGraph Implementation Report](./LangGraph_Report.md)
- [AI Agent Planning Document](./planning-document.md)
# AI Study Partner Finder — StudentPlanner

An AI-powered education platform that helps students find compatible study partners using **three complementary AI/protocol layers**: **CrewAI** (multi-agent partner analysis), **LangGraph** (intelligent study assistant with self-correcting graph-based workflow), and **MCP** (Model Context Protocol for standardized tool access).

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
│  │   Agent      │  Shared│   │ • MCP Client      │          │
│  │ • Study      │   DB   │   │ Tools:            │          │
│  │   Planner    │◄──────►│   │ • search_partners │          │
│  └──────────────┘        │   │ • list_courses    │          │
│                          │   │ • get_partner_stats│         │
│                          │   │   via local or MCP │         │
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

### MCP — Standardized Tool Access
- **MCP Server**: Exposes `search_partners`, `list_courses`, and `get_partner_stats` as MCP tools
- **LangGraph MCP Client**: The assistant can load the same tools over MCP instead of importing Python functions directly
- **Visible Process Panel**: Each assistant answer shows whether tools came from MCP or local fallback, plus tool inputs and result summaries
- **Safe Fallback**: If MCP is unavailable, LangGraph falls back to the original local tools so chat continues to work

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
│   ├── mcp_server.py             # MCP server exposing StudentPlanner tools
│   ├── partner_services.py       # Shared DB query logic for local tools + MCP tools
│   ├── tools.py                  # LangChain tool definitions
│   ├── database.py               # Shared database access
│   └── requirements.txt
│
├── vite.config.js                # Vite proxy (routes to both backends)
├── CrewAI_Report.md              # CrewAI implementation report
├── LangGraph_Report.md           # LangGraph implementation report
├── MCP_Report.md                 # MCP integration report and demo guide
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

The LangGraph backend automatically starts the MCP server as a local stdio process when MCP mode is enabled, so you do not need to run a separate MCP service manually.

### Environment Variables

| Variable | Description | Used By |
|----------|-------------|---------|
| `OPENROUTER_API_KEY` | OpenRouter API key (recommended) | Both backends |
| `OPENROUTER_MODEL` | Model ID (default: `deepseek/deepseek-chat`) | Both backends |
| `GEMINI_API_KEY` | Google Gemini fallback key | Both backends |
| `LANGCHAIN_TRACING_V2` | Enable LangSmith tracing (`true`) | LangGraph |
| `LANGCHAIN_API_KEY` | LangSmith API key | LangGraph |
| `LANGCHAIN_PROJECT` | LangSmith project name | LangGraph |
| `USE_MCP_TOOLS` | Use MCP-backed tools in LangGraph (`true` by default) | LangGraph |
| `MCP_PYTHON_EXECUTABLE` | Optional Python executable used to start the MCP server | LangGraph |

## 🔌 MCP — How It Works

MCP is **not** replacing LangGraph in this project.

- **LangGraph** decides what to do, when to call tools, and when to retry.
- **MCP** standardizes how those tools are exposed and consumed.

Current flow:

```text
User → React Assistant UI → FastAPI LangGraph Backend
    → Worker Node decides a tool is needed
    → MCP client starts StudentPlanner MCP server (stdio)
    → MCP tool runs shared database query
    → Tool result returns to LangGraph
    → Evaluator checks the answer
    → UI shows the reply + MCP process metadata
```

If MCP is unavailable, the assistant falls back to the original local LangChain tools so the chat still works.

## 🎓 MCP Demo Guide

For classroom demonstration, open the Study Assistant page and ask questions such as:

- `Hangi dersler mevcut?`
- `Algoritmalar dersi icin aksam calisabilecek partner var mi?`
- `Veri Yapilari dersinin partner istatistiklerini goster`

Under each assistant response you will see:

- whether the answer used `MCP Server` or `Yerel Tool`
- the graph path (`worker → tools → worker → evaluator`)
- tool names
- tool parameters
- summarized results returned from the tool

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
- [MCP Integration Report](./MCP_Report.md)
- [AI Agent Planning Document](./planning-document.md)
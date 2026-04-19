# LangGraph Implementation Report

## 1. Project Overview & Integration

This report documents the LangGraph implementation added to the existing **StudentPlanner** application alongside CrewAI. LangGraph provides an intelligent Study Assistant chatbot that uses a self-correcting graph-based workflow to help students find study partners, explore courses, and receive academic advice.

**Key Point:** LangGraph was added into the existing project — it is NOT a separate project. Both CrewAI (partner matching) and LangGraph (study assistant) coexist and share the same database.

### Architecture Diagram

```
┌──────────────────── StudentPlanner ────────────────────┐
│                                                         │
│  React Frontend (Vite)                                  │
│  ├── MatchingPage    → CrewAI Backend (port 8000)       │
│  └── AssistantPage   → LangGraph Backend (port 8001)    │
│                                                         │
│  ┌─── CrewAI Backend ───┐  ┌── LangGraph Backend ──┐   │
│  │ skill_analyzer       │  │ Worker Node           │   │
│  │ compatibility_agent  │  │ Evaluator Node        │   │
│  │ study_planner        │  │ Tools Node            │   │
│  │ Sequential Process   │  │ MemorySaver           │   │
│  └──────────┬───────────┘  └──────────┬────────────┘   │
│             └──── Shared partners.db ──┘                 │
└─────────────────────────────────────────────────────────┘
```

## 2. LangGraph Purpose & Why We Used It

**LangGraph** is a library for building stateful, multi-actor applications using graph-based workflows. Unlike simple chain-based LLM calls, LangGraph enables:

- **Cyclic graphs**: The evaluator can send work back to the worker for self-correction
- **State management**: `TypedDict` state flows through nodes with automatic message accumulation
- **Tool integration**: Worker node can invoke tools (database queries) and receive results
- **Checkpointing**: `MemorySaver` preserves conversation history across interactions
- **Observability**: LangSmith integration traces every node execution

We chose LangGraph for the Study Assistant because it requires **iterative reasoning** — the assistant must query the database, evaluate results, and potentially retry with different parameters.

## 3. Graph Flow — Step by Step

The implementation follows the **Sidekick pattern** from the course (`ed-donner/agents/4_langgraph/sidekick.py`):

```
  ┌─────────────────────────────────────┐
  │              START                  │
  └──────────────┬──────────────────────┘
                 │
                 ▼
  ┌─────────────────────────────────────┐
  │           WORKER NODE               │
  │  • Receives user message            │
  │  • Has system prompt with context   │
  │  • Tools bound to LLM              │
  │  • Decides: use tool or respond     │
  └──────────┬──────────┬──────────────┘
             │          │
     tool_calls?    no tools
             │          │
             ▼          ▼
  ┌──────────────┐  ┌──────────────────────┐
  │  TOOLS NODE  │  │   EVALUATOR NODE     │
  │  • Executes  │  │  • Checks quality    │
  │    tool calls│  │  • Structured output │
  │  • Returns   │  │  • EvaluatorOutput:  │
  │    results   │  │    - feedback        │
  └──────┬───────┘  │    - success_met     │
         │          │    - input_needed    │
         │          └───┬──────┬───────────┘
         │              │      │
         ▼          success  fail/retry
  ┌──────────┐     or input    │
  │  WORKER  │     needed      │
  │  (loop)  │◄────────────────┘
  └──────────┘      │
                    ▼
              ┌──────────┐
              │   END    │
              └──────────┘
```

### Step Details:

1. **START → Worker**: User sends a message. Worker receives it with a system prompt defining its role as a Study Assistant.

2. **Worker → Router**: After LLM response, the router checks:
   - If `tool_calls` present → route to **Tools** node
   - If no tool calls → route to **Evaluator** node

3. **Tools → Worker**: Tool results are returned, Worker processes them and generates a new response.

4. **Evaluator → Router**: Evaluator uses `with_structured_output(EvaluatorOutput)` to assess:
   - `success_criteria_met: true` → **END**
   - `user_input_needed: true` → **END**
   - Both false → **Worker** (retry with feedback)

5. **MemorySaver**: All messages are persisted using `thread_id`, enabling multi-turn conversations.

## 4. Implementation Details

### State Definition (`agent.py`)

```python
class State(TypedDict):
    messages: Annotated[List[Any], add_messages]  # Message accumulator
    success_criteria: str                          # What counts as success
    feedback_on_work: Optional[str]                # Evaluator feedback
    success_criteria_met: bool                     # Evaluator verdict
    user_input_needed: bool                        # Need more user input?
```

### Graph Construction (`agent.py`)

```python
graph_builder = StateGraph(State)

# Nodes
graph_builder.add_node("worker", self.worker)
graph_builder.add_node("tools", ToolNode(tools=self.tools))
graph_builder.add_node("evaluator", self.evaluator)

# Edges
graph_builder.add_edge(START, "worker")
graph_builder.add_conditional_edges("worker", self.worker_router,
    {"tools": "tools", "evaluator": "evaluator"})
graph_builder.add_edge("tools", "worker")
graph_builder.add_conditional_edges("evaluator", self.route_based_on_evaluation,
    {"worker": "worker", "END": END})

# Compile with checkpointer
self.graph = graph_builder.compile(checkpointer=self.memory)
```

### Tool Definitions (`tools.py`)

```python
@tool
def search_partners(course: str, level: str = "", time: str = "", study_type: str = "") -> str:
    """Search for study partners in the database by course, level, time slot, and study type."""

@tool
def list_courses() -> str:
    """List all unique courses available in the database."""

@tool
def get_partner_stats(course: str) -> str:
    """Get statistics about partners for a specific course."""
```

### Evaluator Structured Output (`agent.py`)

```python
class EvaluatorOutput(BaseModel):
    feedback: str = Field(description="Feedback on the assistant's response")
    success_criteria_met: bool = Field(description="Whether the success criteria have been met")
    user_input_needed: bool = Field(description="True if more input is needed from the user")
```

## 5. LangSmith Integration

LangSmith provides full observability of the graph execution. When enabled, every node execution, tool call, and LLM invocation is traced and visible in the LangSmith dashboard.

**Configuration (`.env`):**
```
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=lsv2_pt_xxxxx
LANGCHAIN_PROJECT=StudentPlanner-LangGraph
```

**What LangSmith traces:**
- Worker node LLM calls (input tokens, output tokens, latency)
- Tool invocations (search_partners, list_courses, get_partner_stats)
- Evaluator decisions (success/fail/retry)
- Full message history per thread
- End-to-end graph execution time

## 6. Frontend Integration

The LangGraph assistant is accessible via the **"Çalışma Asistanı"** (Study Assistant) page in the navigation bar. The chat interface includes:

- Real-time message exchange with the LangGraph backend
- Typing indicator during processing
- Suggestion chips for common queries
- Session reset functionality
- Graph flow visualization showing the Worker → Evaluator → Tools pipeline

**API Integration:**
```javascript
// config.js
export const LANGGRAPH_BASE = import.meta.env.VITE_LANGGRAPH_URL ?? ''

// Vite proxy routes /api/assistant/* to port 8001
// and /api/* to port 8000 (CrewAI)
```

## 7. CrewAI & LangGraph — Side by Side

Both AI systems coexist in the same project with different responsibilities:

| Feature | CrewAI | LangGraph |
|---------|--------|-----------|
| **Purpose** | Partner matching & analysis | Interactive study assistant |
| **Architecture** | Sequential multi-agent pipeline | Graph-based stateful workflow |
| **Agents/Nodes** | 3 agents (sequential) | 3 nodes (cyclic) |
| **Interaction** | One-shot (request → result) | Multi-turn chat |
| **Memory** | Stateless per request | Thread-based with MemorySaver |
| **Port** | 8000 | 8001 |
| **Database** | partners.db | partners.db (shared) |

## 8. Git Repository

**Git URL:** https://github.com/mslmagh/StudentPlanner

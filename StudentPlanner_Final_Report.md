# LangGraph & CrewAI Implementation Report

MÜSLÜM AGAH - 20210808042
STUDENT PLANNER

## 1. Project Overview
This project integrates an interactive **LangGraph Study Assistant** alongside the existing **CrewAI Partner Matching** system into the "StudentPlanner" application. Both AI systems coexist intelligently within the same application:
- **CrewAI** handles the background partner matching, evaluating compatibility, and schedule planning.
- **LangGraph** provides an intelligent, self-correcting chat interface where students can ask for advice, query available courses, and dynamically search the shared database.

## 2. LangGraph Architecture & Its Purpose
LangGraph was used because it handles **stateful, cyclic workflows** with ease, enabling the Study Assistant to "reason, act, and self-correct." Unlike traditional linear LLMs, our LangGraph implementation features a **Sidekick pattern** defined by well-structured steps:

### [BURAYA EKRAN GÖRÜNTÜSÜ KOYUN: agent.py dosyasındaki graph_builder = StateGraph(State) ve add_node/add_edge tanımlamalarının olduğu kod kısmı]
**Execution Detail:** The diagram above shows how exactly steps are well defined. The process starts at the `START` node and enters the **Worker Node**. If the LLM needs data, it routes to the **Tools Node**. Once a response is generated, it routes to the **Evaluator Node** (Structured Output) ensuring the response meets strict success criteria. If the response is insufficient, it dynamically self-corrects and goes back to the Worker.

## 3. LangGraph Tools & Actions
The LangGraph assistant runs on Port 8001 and executes precise queries utilizing the shared `partners.db` SQLite database alongside CrewAI.

### [BURAYA EKRAN GÖRÜNTÜSÜ KOYUN: tools.py dosyasından @tool decoratorleri (search_partners, list_courses)]
**Execution Detail:** The LLM actively interacts with our app data. Above, the tool scripts show how the LangGraph agent parses the user’s text and fetches available course lists or partner stats directly from the matching system.

## 4. Application Screenshots & Explanations

### Frontend: LangGraph Study Assistant Interface
### [BURAYA EKRAN GÖRÜNTÜSÜ KOYUN: Frontend'de Çalışma Asistanı sekmesinde asistanla yapılan örnek bir konuşma (Örn: "Matematik dersinde partner arıyorum" yazıp asistanın cevap verdiği an)]
**Execution Detail:** The user asks a question via the chat interface. A `thread_id` keeps track of the memory (MemorySaver). The Worker Node evaluates the request, uses the `search_partners` Tool to query the database, and provides a conversational response. All running seamlessly without creating a separate new project.

### Frontend: Original CrewAI Matching (Working Alongside LangGraph)
### [BURAYA EKRAN GÖRÜNTÜSÜ KOYUN: Frontend'de Eşleşme (Matching) formunun veya sonuçlarının başarıyla geldiği sekme]
**Execution Detail:** True to the instructions, the original CrewAI pipeline (Skill analysis, Compatibility scoring, and Study planning) remains fully functional on Port 8000, coexisting with the new LangGraph addition.

## 5. LangSmith Integration (Observability)
To ensure we understand perfectly what the LangGraph agent does, the implementation includes LangSmith tracing.

### [BURAYA EKRAN GÖRÜNTÜSÜ KOYUN: LangSmith Dashboard'undaki "Tracing" veya Proje sayfanızı gösteren ekran görüntüsü (yukarıdaki sohbette paylaştığınız ss)]
**Execution Detail:** The screenshot demonstrates the active LangSmith integration configured via `.env` files. It tracks token usage, Latency, Tool Execution times, and allows us to verify the evaluator’s self-correction loops visually.

## 6. Git Repository
**Git URL:** https://github.com/mslmagh/StudentPlanner

# AI Study Partner Finder – AI Agent Planning Document

## 1) Project Overview

### Purpose of the System
AI Study Partner Finder is a student-centered matching platform inspired by ride-matching systems like Uber. The objective is to reduce the friction students face when trying to find suitable classmates for collaborative study. Instead of manually searching through class groups or social media, students submit a structured study request and receive partner suggestions based on compatibility factors.

The current Homework 2 implementation focuses on a **frontend-only prototype** with simulated behavior. It demonstrates the user journey, interface structure, and rule-based matching logic with mock data.

### Target Users
- University and high school students
- Learners preparing for exams in shared subjects
- Students looking for peers at similar skill levels and preferred study schedules

### Core Features in Current Draft
1. **Home page introduction** with project concept and call-to-action
2. **Create Request form** with required fields:
   - Course
   - Level (Beginner / Intermediate / Advanced)
   - Preferred Time
   - Study Type (Online / In-person)
3. **Matching page simulation** with progressive loading states:
   - “Searching for study partners...”
   - “Analyzing schedules...”
   - “Matching skill levels...”
4. **Active Sessions page** listing matched partners from mock data
5. **Simple rule-based matching logic** to emulate system decisions

### Scope of Homework 2
- Frontend only (React + Vite)
- Static JSON data
- No authentication
- No backend/database integration
- No AI API calls yet

This scope is intentional to validate UI/UX and flow before backend and AI architecture are introduced.

---

## 2) AI Agent Concept (Future Vision)

This section defines the intended transition from a basic rule engine to an intelligent multi-agent system.

### Problem to Solve
Rule-based matching works for simple criteria but cannot model deeper study compatibility, such as:
- Learning style differences
- Dynamic schedule changes
- Weak/strong topic alignment
- Session consistency and completion behavior

An AI-driven architecture can improve both matching quality and learning outcomes.

### Proposed Agents

#### 1. Skill Analyzer Agent
**Goal:** Estimate each student’s current competency profile.

**Inputs (future):**
- Self-reported confidence
- Quiz performance
- Past session outcomes
- Assignment trends

**Outputs:**
- Skill level by topic
- Confidence score
- Recommended partner profile

#### 2. Compatibility Matching Agent
**Goal:** Produce partner recommendations based on multi-factor compatibility.

**Decision dimensions:**
- Course and topic overlap
- Skill proximity or complementary pairing
- Time-window compatibility
- Study type preference (online/in-person)
- Reliability score (attendance consistency)

**Output:** Ranked list of recommended partners with confidence explanation.

#### 3. Study Planner Agent
**Goal:** Build personalized micro-study plans for matched pairs.

**Capabilities:**
- Suggest weekly goals
- Generate session agenda templates
- Recommend time-boxed exercises
- Track progress milestones

#### 4. Reminder Agent
**Goal:** Increase session completion and retention.

**Capabilities:**
- Timely reminders before sessions
- Follow-up nudges after missed sessions
- Motivational check-ins
- Streak and consistency prompts

### Agent Interaction Model

#### Optional Chat Interface
Students may interact with the system via chat prompts:
- “Find me a calculus partner this evening.”
- “Create a 3-day review plan for derivatives.”

#### Background Decision-Making
Most agent operations should run asynchronously in the background:
1. Ingest user request
2. Enrich profile signals
3. Run compatibility scoring
4. Return best partner options
5. Trigger planning/reminder workflows

---

## 3) System Architecture (High-Level)

### Current vs Future Architecture

**Current prototype**
- Frontend-only React app
- Local state management
- Static JSON data
- Rule-based function for matching

**Future production direction**
- Full-stack architecture with API layer
- Persistent user and session data
- AI agent orchestration (CrewAI)
- Optional third-party integrations (calendar, notifications)

### Required Statement
**Current system uses rule-based matching with mock data. Future system will use CrewAI multi-agent architecture.**

### High-Level Request Flow

1. User submits request from frontend
2. Backend validates input and enriches with profile context
3. AI agent orchestrator coordinates specialized agents
4. Compatibility result is computed and ranked
5. Frontend displays recommendations and session actions

### ASCII Architecture Diagram

```text
                +----------------------+
                |       Student        |
                +----------+-----------+
                           |
                           v
                +----------------------+
                |      Frontend UI     |
                | (React Web App)      |
                +----------+-----------+
                           |
                           v
                +----------------------+
                |   Backend API Layer  |
                |  (Future: Node/Fast) |
                +----------+-----------+
                           |
            +--------------+---------------+
            |                              |
            v                              v
 +----------------------+     +----------------------+
 |   CrewAI Orchestrator|---->|   External Services  |
 |                      |     |(Calendar/Notify APIs)|
 +----------+-----------+     +----------------------+
            |
   +--------+--------+-------------------------+
   |                 |                         |
   v                 v                         v
+---------+   +--------------+         +---------------+
| Skill   |   | Compatibility|         | Study Planner |
| Analyzer|   | Matching     |         | Agent         |
+---------+   | Agent        |         +-------+-------+
              +------+-------+                 |
                     |                         v
                     +---------------> +---------------+
                                        | Reminder Agent|
                                        +---------------+
```

### Component Responsibilities

#### Frontend Role
- Collect request input
- Display loading and results
- Show active sessions and user-facing actions
- Provide responsive and simple UX

#### Backend Role (Future)
- Store users, requests, sessions, and analytics
- Expose REST/GraphQL endpoints
- Handle authentication and authorization
- Manage queue/event processing for asynchronous agent jobs

#### AI/CrewAI Role
- Run task-specific agents
- Aggregate insights and confidence
- Return explainable matching outputs
- Trigger study planning and reminders

#### External APIs (Optional)
- Calendar API: availability synchronization
- Notification API: email/push reminders
- Learning tools: quiz/performance imports

---

## 4) Implementation Roadmap

### Phase 1 – Prototype (Current Homework)
- Build working frontend and user flow
- Add rule-based matching on mock data
- Validate usability and core navigation

### Phase 2 – Backend Enablement
- Add persistent datastore
- Build request/session endpoints
- Move matching logic from client to server

### Phase 3 – AI Agent Integration
- Introduce CrewAI orchestration service
- Implement Skill Analyzer and Compatibility agents
- Add explainable score output

### Phase 4 – Learning Optimization
- Add Study Planner and Reminder agents
- Track outcomes and retention metrics
- Use feedback loops for recommendation quality

### Phase 5 – Production Hardening
- Security, authentication, monitoring
- Load testing and reliability tuning
- CI/CD with staged deployment

---

## 5) Risks and Mitigations

### Risk 1: Low-Quality Profile Data
**Issue:** Inaccurate self-assessment harms matching quality.  
**Mitigation:** Blend self-report with lightweight quizzes and behavioral signals.

### Risk 2: Agent Decision Opacity
**Issue:** Users may not trust recommendations.  
**Mitigation:** Provide transparent reasons (“same course + overlapping schedule + similar level”).

### Risk 3: Cold Start Problem
**Issue:** New users have little historical data.  
**Mitigation:** Use fallback rule-based matching with confidence indicators.

### Risk 4: Schedule Volatility
**Issue:** Students frequently change availability.  
**Mitigation:** Keep time preferences updateable and recalculate compatibility often.

---

## 6) Success Metrics

Suggested KPIs for future versions:
- Match acceptance rate
- Session completion rate
- Weekly active study pairs
- Repeat pairing rate
- Student satisfaction (post-session rating)
- Learning outcome improvement (self-reported + quiz deltas)

---

## 7) Conclusion

The current Homework 2 version delivers a complete, deployable frontend prototype that clearly demonstrates the concept and workflow of AI Study Partner Finder. It intentionally uses a simple rule engine and mock data to validate core product assumptions quickly.

The long-term system evolution is a CrewAI-based multi-agent architecture that can provide smarter, explainable, and adaptive matching for students while improving study consistency and outcomes.
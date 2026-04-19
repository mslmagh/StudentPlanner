# CrewAI Implementation Report

## 1. Project Overview & Integration

This project integrates CrewAI into the existing "StudentPlanner" application. It is not an independent script but a functional backend AI service that adds intelligent features to the platform. By analyzing user requests, the CrewAI system evaluates skill gaps, calculates compatibility scores between students, and dynamically generates personalized 1-week study plans for matched partners.

### Architecture

```
User Request → CrewAI Backend (port 8000)
                  │
                  ├── 1. Skill Analyzer Agent
                  │      → Profiles student skill gaps
                  │
                  ├── 2. Compatibility Agent
                  │      → Scores partner compatibility (0-100)
                  │
                  └── 3. Study Planner Agent
                         → Generates 1-week study plan
                  
                  → Results sent back to React frontend
```

## 2. Configuration Files (YAML)

### agents.yaml — Agent Definitions

The agents are defined in `crew_backend/config/agents.yaml` with specific roles, goals, and backstories:

- **Skill Analyzer**: Expert academic advisor that examines student's course, level, and learning context to identify skill requirements and knowledge gaps
- **Compatibility Agent**: Behavioral scientist that evaluates partner compatibility based on course alignment, skill level, schedule overlap, and study style preferences (scores 0-100)
- **Study Planner**: Academic coach that creates personalized 1-week study plans with 5 sessions tailored to the matched pair

### tasks.yaml — Task Definitions

Tasks are defined in `crew_backend/config/tasks.yaml` with detailed descriptions and expected outputs:

- **analyze_skills_task**: Analyzes student's study request, identifies core skills needed, knowledge gaps, and ideal partner profile (3-5 bullet points)
- **compatibility_task**: Evaluates compatibility score (0-100) between requesting student and candidate partner with 2 key reasons
- **study_planning_task**: Designs 5-session weekly study plan with day, duration (45-90 min), and specific topic/activity

## 3. Implementation & Kickoff Code

### Agent and Task Decorators (`crew.py`)

The `StudyPartnerCrew` class uses CrewAI's decorator pattern:

```python
@CrewBase
class StudyPartnerCrew:
    agents_config = "config/agents.yaml"
    tasks_config = "config/tasks.yaml"

    @agent
    def skill_analyzer(self) -> Agent:
        return Agent(config=self.agents_config["skill_analyzer"], llm=self._model())

    @agent
    def compatibility_agent(self) -> Agent: ...

    @agent
    def study_planner(self) -> Agent: ...

    @task
    def analyze_skills_task(self) -> Task: ...
    
    @task
    def compatibility_task(self) -> Task: ...
    
    @task
    def study_planning_task(self) -> Task: ...

    @crew
    def crew(self) -> Crew:
        return Crew(agents=self.agents, tasks=self.tasks, process=Process.sequential)
```

### Kickoff Logic (`crew.py`)

```python
def run_crew(course, level, preferred_time, study_type, partner):
    inputs = {
        "course": course,
        "level": level,
        "preferred_time": preferred_time,
        "study_type": study_type,
        "partner_profile": f"Name={partner['name']}, Course={partner['course']}, ..."
    }
    result = StudyPartnerCrew().crew().kickoff(inputs=inputs)
    # Extract task outputs: skill_analysis, compatibility, study_plan
```

## 4. Application Screenshots — Feature Descriptions

### Frontend: Study Request Form
When the user submits their study preferences on this screen, the data (course, level, preferred time, study type) is sent to the backend. The `skill_analyzer` agent processes these inputs to identify the student's skill profile and potential knowledge gaps.

### Frontend: Matching Results & AI Analysis
This screen displays the AI-generated results. The `compatibility_agent` calculates a realistic compatibility score (0-100) between the user and potential partners. Subsequently, the `study_planner` agent creates the customized 5-session weekly study plan tailored specifically to the matched pair's parameters. Users can interact with their matched partner via the "Send Message" (Mesaj Gönder) feature or schedule their AI-generated plan using the "Add to Calendar" (Takvime Ekle) function.

### Frontend: Active Sessions & Study Room
After the AI completes the matching and planning, users can manage their study sessions. The Active Sessions page shows all matched partners with their compatibility scores. The study room enables collaborative studying.

## 5. Git Repository

**Git URL:** https://github.com/mslmagh/StudentPlanner
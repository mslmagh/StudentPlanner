import json
import os
import re
import time
from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task


@CrewBase
class StudyPartnerCrew:
    """Study Partner Finder Crew"""

    agents_config = "config/agents.yaml"
    tasks_config = "config/tasks.yaml"

    def _model(self) -> str:
        # OPENROUTER_MODEL'de prefix yoksa otomatik ekle (örn: deepseek/deepseek-v3.2).
        openrouter_model = os.getenv("OPENROUTER_MODEL")
        if openrouter_model:
            model = openrouter_model.strip()
            if model and not model.startswith("openrouter/"):
                return f"openrouter/{model}"
            return model

        return os.getenv("GEMINI_MODEL") or "openrouter/deepseek/deepseek-v3.2"

    @agent
    def skill_analyzer(self) -> Agent:
        return Agent(
            config=self.agents_config["skill_analyzer"],
            llm=self._model(),
            verbose=False,
        )

    @agent
    def compatibility_agent(self) -> Agent:
        return Agent(
            config=self.agents_config["compatibility_agent"],
            llm=self._model(),
            verbose=False,
        )

    @agent
    def study_planner(self) -> Agent:
        return Agent(
            config=self.agents_config["study_planner"],
            llm=self._model(),
            verbose=False,
        )

    @task
    def analyze_skills_task(self) -> Task:
        return Task(config=self.tasks_config["analyze_skills_task"])

    @task
    def compatibility_task(self) -> Task:
        return Task(config=self.tasks_config["compatibility_task"])

    @task
    def study_planning_task(self) -> Task:
        return Task(config=self.tasks_config["study_planning_task"])

    @crew
    def crew(self) -> Crew:
        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            process=Process.sequential,
            verbose=False,
        )


def _parse_score(text: str) -> int:
    """
    XX/100 formatındaki ilk sayıyı yakalar.
    "Puan: 85/100" veya "Score: 85/100" veya "Genel Puan: 90/100" hepsini destekler.
    """
    match = re.search(r'(\d{1,3})/100', text)
    if match:
        return min(int(match.group(1)), 100)
    return 0


def run_crew(course: str, level: str, preferred_time: str, study_type: str, partner: dict) -> dict:
    """
    Run the Study Partner Crew and return structured results.
    partner: dict with keys name, course, level, time, studyType
    """
    partner_profile = (
        f"Name={partner['name']}, Course={partner['course']}, "
        f"Level={partner['level']}, Time={partner['time']}, "
        f"StudyType={partner['studyType']}"
    )

    inputs = {
        "course": course,
        "level": level,
        "preferred_time": preferred_time,
        "study_type": study_type,
        "partner_profile": partner_profile,
    }

    last_error = None
    for attempt in range(3):
        try:
            result = StudyPartnerCrew().crew().kickoff(inputs=inputs)
            break
        except Exception as exc:
            last_error = exc
            msg = str(exc).lower()
            transient = (
                "apiconnectionerror" in msg
                or "getaddrinfo failed" in msg
                or "connection error" in msg
                or "name resolution" in msg
                or "timed out" in msg
            )
            if not transient or attempt == 2:
                raise
            # Geçici ağ hatalarında kısa bekleme ile yeniden dene.
            time.sleep(1.2 * (attempt + 1))

    if last_error and 'result' not in locals():
        raise last_error

    # Extract task outputs in order: skill_analysis, compatibility, plan
    task_outputs = result.tasks_output
    skill_analysis = task_outputs[0].raw if len(task_outputs) > 0 else ""
    compatibility_raw = task_outputs[1].raw if len(task_outputs) > 1 else ""
    study_plan = task_outputs[2].raw if len(task_outputs) > 2 else ""

    compatibility_score = _parse_score(compatibility_raw)

    return {
        "matched_partner": partner,
        "skill_analysis": skill_analysis,
        "compatibility_raw": compatibility_raw,
        "compatibility_score": compatibility_score,
        "study_plan": study_plan,
    }

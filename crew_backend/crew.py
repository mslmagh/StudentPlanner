import json
from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task


@CrewBase
class StudyPartnerCrew:
    """Study Partner Finder Crew"""

    agents_config = "config/agents.yaml"
    tasks_config = "config/tasks.yaml"

    @agent
    def skill_analyzer(self) -> Agent:
        return Agent(
            config=self.agents_config["skill_analyzer"],
            verbose=False,
        )

    @agent
    def compatibility_agent(self) -> Agent:
        return Agent(
            config=self.agents_config["compatibility_agent"],
            verbose=False,
        )

    @agent
    def study_planner(self) -> Agent:
        return Agent(
            config=self.agents_config["study_planner"],
            verbose=False,
        )

    @agent
    def match_evaluator(self) -> Agent:
        return Agent(
            config=self.agents_config["match_evaluator"],
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

    @task
    def evaluation_task(self) -> Task:
        return Task(config=self.tasks_config["evaluation_task"])

    @crew
    def crew(self) -> Crew:
        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            process=Process.sequential,
            verbose=False,
        )


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

    result = StudyPartnerCrew().crew().kickoff(inputs=inputs)

    # Extract task outputs in order: skill_analysis, compatibility, plan, evaluation
    task_outputs = result.tasks_output
    skill_analysis = task_outputs[0].raw if len(task_outputs) > 0 else ""
    compatibility_raw = task_outputs[1].raw if len(task_outputs) > 1 else ""
    study_plan = task_outputs[2].raw if len(task_outputs) > 2 else ""
    evaluation_raw = task_outputs[3].raw if len(task_outputs) > 3 else ""

    # Parse compatibility score from text "Score: XX/100..."
    compatibility_score = 0
    try:
        for token in compatibility_raw.split():
            token_clean = token.replace("/100", "").replace(".", "").strip()
            if token_clean.isdigit():
                compatibility_score = int(token_clean)
                break
    except Exception:
        compatibility_score = 0

    # Parse overall score from evaluation "Overall Score: XX/100..."
    overall_score = 0
    try:
        for token in evaluation_raw.split():
            token_clean = token.replace("/100", "").replace(".", "").strip()
            if token_clean.isdigit():
                overall_score = int(token_clean)
                break
    except Exception:
        overall_score = 0

    return {
        "matched_partner": partner,
        "skill_analysis": skill_analysis,
        "compatibility_raw": compatibility_raw,
        "compatibility_score": compatibility_score,
        "study_plan": study_plan,
        "evaluation_raw": evaluation_raw,
        "overall_score": overall_score,
    }

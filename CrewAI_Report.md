# Crew AI Implementation Report

## 1. Project Overview & Homework 2 Integration
This project integrates Crew AI into the existing "StudentPlanner" application (Homework 2). It is not an independent script but a functional backend AI service that adds intelligent features to the platform. By analyzing user requests, the Crew AI system evaluates skill gaps, calculates compatibility scores between students, and dynamically generates personalized 1-week study plans for matched partners.

## 2. Configuration Files (YAML)
Below are the screenshots of our configuration files defining the roles, goals, and expected outputs of our AI system.

**[INSERT SCREENSHOT HERE - agents.yaml]**
*(Screenshot showing agent roles, goals, and backstories)*

**[INSERT SCREENSHOT HERE - tasks.yaml]**
*(Screenshot showing task descriptions and expected outputs)*

## 3. Implementation & Kickoff Code
The following screenshots demonstrate how the AI agents and tasks are defined in the code, assembled into a Crew, and kicked off (executed) using the incoming application data.

**[INSERT SCREENSHOT HERE - crew.py (Agent and Task Definitions)]**
*(Screenshot showing the @agent, @task, and @crew decorators)*

**[INSERT SCREENSHOT HERE - crew.py (Kickoff logic)]**
*(Screenshot showing the run_crew function where data becomes inputs and kickoff() is called)*

## 4. Application Screenshots and Explanations

**[INSERT SCREENSHOT HERE - Frontend: Study Request Form]**
**Execution Detail:** When the user submits their study preferences on this screen, the data (course, level, preferred time) is sent to the backend. The `skill_analyzer` agent processes these inputs to identify the student's skill profile and potential knowledge gaps.

**[INSERT SCREENSHOT HERE - Frontend: Matching Results & Study Plan]**
**Execution Detail:** This screen displays the AI-generated results. The `compatibility_agent` calculates a realistic compatibility score (0-100) between the user and potential partners. Subsequently, the `study_planner` agent creates the customized 5-session weekly study plan tailored specifically to the matched pair's parameters. Furthermore, users can directly interact with their matched partner via the "Send Message" (Mesaj Gönder) feature or easily schedule their AI-generated plan using the "Add to Calendar" (Takvime Ekle) function.

**[INSERT SCREENSHOT HERE - Frontend: Live Study Session Room]**
**Execution Detail:** After the AI completes the matching and planning, users can start a collaborative study session by clicking "Start Session" (Oturumu Başlat). This opens a live virtual classroom where partners can study together using video and audio, effectively putting the AI-generated curriculum into practice.

## 5. Git Repository
**Git URL:** [INSERT YOUR GITHUB/GITLAB LINK HERE]
"""
LangGraph Study Assistant - Tool Definitions
=============================================
Kursta (ed-donner/agents/4_langgraph/sidekick_tools.py) Sidekick'in
playwright, search, file, wikipedia gibi araçları vardı.

Biz bunları StudentPlanner domain'ine uyarlıyoruz:
  - search_partners: Veritabanından partner arama
  - list_courses: Mevcut dersleri listeleme
  - get_partner_stats: Bir dersin partner istatistiklerini getirme

Kursta langchain.agents.Tool kullanılıyordu, biz @tool decorator ile
aynı şeyi yapıyoruz (langchain_core.tools.tool).
"""

import json
from database import SessionLocal, Partner
from langchain_core.tools import tool


@tool
def search_partners(course: str, level: str = "", time: str = "", study_type: str = "") -> str:
    """Search for study partners in the database by course, level, time slot, and study type.
    At minimum a course name is required. Other filters are optional.
    Returns a JSON list of matching partners."""
    db = SessionLocal()
    try:
        query = db.query(Partner)
        if course:
            query = query.filter(Partner.course == course)
        if level:
            query = query.filter(Partner.level == level)
        if time:
            query = query.filter(Partner.time == time)
        if study_type:
            query = query.filter(Partner.studyType == study_type)

        partners = query.limit(10).all()
        if not partners:
            return json.dumps({"message": "Bu kriterlere uygun partner bulunamadı.", "results": []}, ensure_ascii=False)

        results = [p.to_dict() for p in partners]
        return json.dumps({"message": f"{len(results)} partner bulundu.", "results": results}, ensure_ascii=False)
    finally:
        db.close()


@tool
def list_courses() -> str:
    """List all unique courses available in the database.
    Returns a JSON list of course names."""
    db = SessionLocal()
    try:
        courses = db.query(Partner.course).distinct().all()
        course_list = sorted([c[0] for c in courses if c[0]])
        return json.dumps({"courses": course_list}, ensure_ascii=False)
    finally:
        db.close()


@tool
def get_partner_stats(course: str) -> str:
    """Get statistics about partners for a specific course: counts by level, time slot, and study type.
    Useful for understanding availability before searching."""
    db = SessionLocal()
    try:
        partners = db.query(Partner).filter(Partner.course == course).all()
        if not partners:
            return json.dumps({"message": f"'{course}' dersi için partner bulunamadı."}, ensure_ascii=False)

        stats = {
            "course": course,
            "total": len(partners),
            "by_level": {},
            "by_time": {},
            "by_study_type": {},
        }

        for p in partners:
            stats["by_level"][p.level] = stats["by_level"].get(p.level, 0) + 1
            stats["by_time"][p.time] = stats["by_time"].get(p.time, 0) + 1
            stats["by_study_type"][p.studyType] = stats["by_study_type"].get(p.studyType, 0) + 1

        return json.dumps(stats, ensure_ascii=False)
    finally:
        db.close()


def get_all_tools():
    """Tüm asistan araçlarını döndür — graph builder tarafından çağrılır."""
    return [search_partners, list_courses, get_partner_stats]

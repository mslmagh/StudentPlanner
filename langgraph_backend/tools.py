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

from langchain_core.tools import tool

from partner_services import get_partner_stats_data, list_courses_data, search_partners_data


@tool
def search_partners(course: str, level: str = "", time: str = "", study_type: str = "") -> str:
    """Search for study partners in the database by course, level, time slot, and study type.
    At minimum a course name is required. Other filters are optional.
    Returns a JSON list of matching partners."""
    return json.dumps(
        search_partners_data(course=course, level=level, time=time, study_type=study_type),
        ensure_ascii=False,
    )


@tool
def list_courses() -> str:
    """List all unique courses available in the database.
    Returns a JSON list of course names."""
    return json.dumps(list_courses_data(), ensure_ascii=False)


@tool
def get_partner_stats(course: str) -> str:
    """Get statistics about partners for a specific course: counts by level, time slot, and study type.
    Useful for understanding availability before searching."""
    return json.dumps(get_partner_stats_data(course), ensure_ascii=False)


def get_all_tools():
    """Tüm asistan araçlarını döndür — graph builder tarafından çağrılır."""
    return [search_partners, list_courses, get_partner_stats]

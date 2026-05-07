from sqlalchemy.orm import Session

from database import Partner, SessionLocal


def _get_session() -> Session:
    return SessionLocal()


def search_partners_data(course: str, level: str = "", time: str = "", study_type: str = "") -> dict:
    db = _get_session()
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
            return {
                "message": "Bu kriterlere uygun partner bulunamadi.",
                "results": [],
            }

        return {
            "message": f"{len(partners)} partner bulundu.",
            "results": [partner.to_dict() for partner in partners],
        }
    finally:
        db.close()


def list_courses_data() -> dict:
    db = _get_session()
    try:
        courses = db.query(Partner.course).distinct().all()
        course_list = sorted([course[0] for course in courses if course[0]])
        return {"courses": course_list}
    finally:
        db.close()


def get_partner_stats_data(course: str) -> dict:
    db = _get_session()
    try:
        partners = db.query(Partner).filter(Partner.course == course).all()
        if not partners:
            return {"message": f"'{course}' dersi icin partner bulunamadi."}

        stats = {
            "course": course,
            "total": len(partners),
            "by_level": {},
            "by_time": {},
            "by_study_type": {},
        }

        for partner in partners:
            stats["by_level"][partner.level] = stats["by_level"].get(partner.level, 0) + 1
            stats["by_time"][partner.time] = stats["by_time"].get(partner.time, 0) + 1
            stats["by_study_type"][partner.studyType] = stats["by_study_type"].get(partner.studyType, 0) + 1

        return stats
    finally:
        db.close()
import os

from partner_services import get_partner_stats_data, list_courses_data, search_partners_data

try:
    from mcp.server.fastmcp import FastMCP
except ImportError as exc:
    raise RuntimeError(
        "MCP dependencies missing. Install 'mcp' in langgraph_backend requirements before running the server."
    ) from exc


mcp = FastMCP("StudentPlanner MCP Tools")


@mcp.tool()
def search_partners(course: str, level: str = "", time: str = "", study_type: str = "") -> dict:
    """Search study partners by course, level, time slot, and study type."""
    return search_partners_data(course=course, level=level, time=time, study_type=study_type)


@mcp.tool()
def list_courses() -> dict:
    """List courses currently available in the shared StudentPlanner database."""
    return list_courses_data()


@mcp.tool()
def get_partner_stats(course: str) -> dict:
    """Return partner availability statistics for a given course."""
    return get_partner_stats_data(course)


if __name__ == "__main__":
    mcp.run(transport=os.getenv("STUDENTPLANNER_MCP_TRANSPORT", "stdio"))
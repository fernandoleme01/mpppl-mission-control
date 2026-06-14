"""
Router: /api/cron — cron jobs do Hermes.
"""
from fastapi import APIRouter

from ..state import _state

router = APIRouter(tags=["cron"])


@router.get("/api/cron")
async def get_cron_jobs():
    """Lista os cron jobs ativos."""
    jobs = _state.get("cron_jobs", [])
    return {"cron_jobs": jobs, "count": len(jobs)}

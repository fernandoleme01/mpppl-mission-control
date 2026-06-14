"""
Router: /api/hermes — status do orquestrador Hermes.
"""
from fastapi import APIRouter

from ..state import _state

router = APIRouter(tags=["hermes"])


@router.get("/api/hermes")
async def get_hermes_status():
    """Status detalhado do Hermes."""
    return {
        "hermes_status": _state.get("hermes_status", {}),
        "hermes_log": _state.get("log_buffer", [])[-10:],
    }

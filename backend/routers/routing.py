"""
Router: /api/routing — roteamento e módulos de prática.
"""
from fastapi import APIRouter

from ..state import _state

router = APIRouter(tags=["routing"])


@router.get("/api/routing")
async def get_routing():
    """Resumo de roteamento e módulos."""
    return {
        "routing_summary": _state.get("routing_summary", {}),
        "modulos": _state.get("modulos", []),
    }

"""
Router: /api/system — métricas do sistema.
"""
from fastapi import APIRouter

from ..state import _state

router = APIRouter(tags=["system"])


@router.get("/api/system")
async def get_system():
    """Métricas de CPU, RAM, disco."""
    return _state.get("system", {})

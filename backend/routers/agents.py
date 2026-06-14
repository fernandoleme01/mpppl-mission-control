"""
Router: /api/agents — subagentes MPPPL e status.
"""
from fastapi import APIRouter

from ..state import _state

router = APIRouter(tags=["agents"])


@router.get("/api/agents")
async def get_agents():
    """Retorna todos os agentes (Hermes + subagentes MPPPL)."""
    return {
        "agents": _state.get("agents", []),
        "subagentes": _state.get("subagentes", []),
    }


@router.get("/api/subagentes/{subagente_id}")
async def get_subagente(subagente_id: str):
    """Retorna detalhes de um subagente específico."""
    for sa in _state.get("subagentes", []):
        if sa["id"] == subagente_id:
            return sa
    return {"error": "subagente not found"}, 404

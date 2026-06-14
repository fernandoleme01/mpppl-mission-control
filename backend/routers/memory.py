"""
Router: /api/memory — memória e RAG (LightRAG + FAISS).
"""
from fastapi import APIRouter

from ..state import _state

router = APIRouter(tags=["memory"])


@router.get("/api/memory")
async def get_memory():
    """Estado da memória e RAG."""
    return {
        "memory_summary": _state.get("memory_summary", {}),
        "memory_events": _state.get("memory_events", []),
        "lightrag_status": _state.get("lightrag_status", "unknown"),
        "faiss_status": _state.get("faiss_status", "unknown"),
    }

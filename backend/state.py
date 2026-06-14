"""
Shared mutable state and WebSocket broadcast helpers — MPPPL Edition.

All modules that need to read or write dashboard state import from here.
"""
import asyncio
import json
from datetime import datetime, timezone
from typing import Any

from fastapi import WebSocket

from .config import SUBAGENTES, MODULOS

# ---------------------------------------------------------------------------
# Shared dashboard state — populated by the background poll loop
# ---------------------------------------------------------------------------

_state: dict[str, Any] = {
    # Serviços monitorados
    "services": {},
    # Agentes (subagentes MPPPL + hermes)
    "agents": [],
    # Cron jobs Hermes
    "cron_jobs": [],
    # Memórias / recalls
    "memories": [],
    "memory_summary": {},
    "memory_events": [],
    # LLM
    "llm_models": [],
    "llm_active": None,
    # Logs
    "log_buffer": [],
    # Estado do Hermes
    "hermes_status": {},
    # Timestamps
    "last_updated": None,
    # Sistema (CPU, RAM, disco)
    "system": {},
    # Histórico de serviços
    "service_history": {},
    # Resumo de roteamento
    "routing_summary": {},
    # Mensagens entre agentes
    "agent_messages": [],
    # --- MPPPL-specific ---
    # Subagentes MPPPL ativos (cópia enriquecida com status em tempo real)
    "subagentes": [],
    # Processos (últimos N do processos.db)
    "processos": [],
    # Resumo dos módulos (agro, rj, civil, geral)
    "modulos": MODULOS,
    # Estatísticas do escritório
    "escritorio_stats": {
        "total_processos": 0,
        "ativos_hoje": 0,
        "prazos_proximos": 0,
        "ultima_atualizacao": None,
    },
    # Insights CTO
    "cto_insights": [],
    # FAISS health
    "faiss_status": "unknown",
    # LightRAG health
    "lightrag_status": "unknown",
}

# Scalars
_trending_cache_time: float = 0.0

# Morning brief cache
_brief_cache: dict[str, Any] = {"text": "", "generated_at": None}

# ---------------------------------------------------------------------------
# WebSocket client registry
# ---------------------------------------------------------------------------

_ws_clients: set[WebSocket] = set()
_ws_lock = asyncio.Lock()

# ---------------------------------------------------------------------------
# Utility
# ---------------------------------------------------------------------------

def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _inicializar_subagentes() -> list[dict]:
    """Retorna lista de subagentes MPPPL com estado inicial."""
    return [
        {
            **s,
            "status": "offline",
            "presence": {"kind": "subagente", "status": "registered", "reason": "Aguardando primeira verificação"},
            "last_active": None,
            "task": None,
        }
        for s in SUBAGENTES
    ]

# Inicializa subagentes na primeira importação
_state["subagentes"] = _inicializar_subagentes()


# ---------------------------------------------------------------------------
# Broadcast helpers
# ---------------------------------------------------------------------------

async def broadcast_status() -> None:
    payload = {
        "type": "status_update",
        "timestamp": _now_iso(),
        "services": _state["services"],
        "agents": _state["agents"],
        "subagentes": _state["subagentes"],
        "cron_jobs": _state["cron_jobs"],
        "memories": _state["memories"],
        "memory_summary": _state["memory_summary"],
        "memory_events": _state["memory_events"],
        "llm_active": _state["llm_active"],
        "system": _state["system"],
        "service_history": _state["service_history"],
        "routing_summary": _state["routing_summary"],
        "agent_messages": _state["agent_messages"],
        # MPPPL-specific
        "processos": _state["processos"],
        "modulos": _state["modulos"],
        "escritorio_stats": _state["escritorio_stats"],
        "cto_insights": _state["cto_insights"],
        "faiss_status": _state["faiss_status"],
        "lightrag_status": _state["lightrag_status"],
        "log_buffer": _state["log_buffer"],
    }
    data = json.dumps(payload)
    async with _ws_lock:
        dead: set[WebSocket] = set()
        for ws in _ws_clients:
            try:
                await ws.send_text(data)
            except Exception:
                dead.add(ws)
        _ws_clients.difference_update(dead)

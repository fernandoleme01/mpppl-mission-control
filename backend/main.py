"""
MPPPL Mission Control Dashboard — FastAPI Backend
Painel em tempo real para o ecossistema de agentes jurídicos MPPPL.
Porta: 8000
"""
import asyncio
import collections
import json
import sqlite3
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Any

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from .config import SESSIONS_DB, POLL_INTERVAL, MAX_WS_CONNECTIONS, PROCESSOS_DB_PATH, FAISS_IDX_PATH
from . import state as _st
from .state import _state, _now_iso, broadcast_status
from .background import (
    run_poll_loop,
    run_processos_poll,
    run_faiss_health_check,
    run_lightrag_health_check,
)

# Routers
from .routers import (
    agents, hermes, system, cron, memory, routing,
)

# ---------------------------------------------------------------------------
# History ring buffer — 1 snapshot/min, 24h max
# ---------------------------------------------------------------------------

_HISTORY_MAX = 1440
_history: collections.deque = collections.deque(maxlen=_HISTORY_MAX)


async def _snapshot_loop() -> None:
    while True:
        await asyncio.sleep(60)
        if _state.get("last_updated"):
            _history.append({
                "ts": _now_iso(),
                "services": dict(_state["services"]),
                "agents": list(_state["agents"]),
                "subagentes": list(_state["subagentes"]),
                "processos": list(_state["processos"]),
                "system": dict(_state["system"]),
            })


# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------

@asynccontextmanager
async def _lifespan(app: FastAPI):
    # Inicializa background tasks
    asyncio.create_task(run_poll_loop())
    asyncio.create_task(run_processos_poll())
    asyncio.create_task(run_faiss_health_check())
    asyncio.create_task(run_lightrag_health_check())
    asyncio.create_task(_snapshot_loop())
    print(f"[startup] MPPPL Mission Control on :8000 — polling every {POLL_INTERVAL}s", flush=True)
    yield


app = FastAPI(
    title="MPPPL Mission Control API",
    description="Painel em tempo real para o ecossistema de agentes jurídicos MPPPL",
    version="1.0.0",
    lifespan=_lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Register routers
# ---------------------------------------------------------------------------

for router_module in (agents, hermes, system, cron, memory, routing):
    app.include_router(router_module.router)

# ---------------------------------------------------------------------------
# Core endpoints
# ---------------------------------------------------------------------------


@app.get("/api/status")
async def api_status():
    """Estado completo do dashboard MPPPL."""
    jobs = []
    for j in _state["cron_jobs"]:
        job = dict(j)
        job["next_run_in_seconds"] = _seconds_until(job.get("next_run_at"))
        jobs.append(job)
    return {
        "timestamp": _now_iso(),
        "last_updated": _state["last_updated"],
        "services": _state["services"],
        "agents": _state["agents"],
        "subagentes": _state["subagentes"],
        "processos": _state["processos"],
        "cron_jobs": jobs,
        "routing_summary": _state["routing_summary"],
        "system": _state["system"],
        "modulos": _state["modulos"],
        "escritorio_stats": _state["escritorio_stats"],
    }


@app.get("/api/history")
async def api_history(t: str | None = None):
    """Return a historical snapshot closest to the given ISO timestamp, or the full buffer."""
    if not t:
        return {"snapshots": list(_history), "count": len(_history)}
    try:
        target = datetime.fromisoformat(t.replace("Z", "+00:00"))
    except ValueError:
        return {"error": "invalid timestamp", "snapshots": []}
    if not _history:
        return {"snapshot": None}
    best = min(
        _history,
        key=lambda s: abs(
            (datetime.fromisoformat(s["ts"].replace("Z", "+00:00")) - target).total_seconds()
        ),
    )
    return {"snapshot": best}


# ---------------------------------------------------------------------------
# WebSocket
# ---------------------------------------------------------------------------


@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    async with _st._ws_lock:
        if len(_st._ws_clients) >= MAX_WS_CONNECTIONS:
            await ws.close(code=1008, reason="Server at capacity")
            return
    await ws.accept()
    async with _st._ws_lock:
        _st._ws_clients.add(ws)

    payload = {
        "type": "status_update",
        "timestamp": _now_iso(),
        "services": _state["services"],
        "agents": _state["agents"],
        "subagentes": _state["subagentes"],
        "processos": _state["processos"],
        "cron_jobs": _state["cron_jobs"],
        "memories": _state["memories"],
        "memory_summary": _state["memory_summary"],
        "memory_events": _state["memory_events"],
        "llm_active": _state["llm_active"],
        "system": _state["system"],
        "modulos": _state["modulos"],
        "escritorio_stats": _state["escritorio_stats"],
        "cto_insights": _state["cto_insights"],
        "faiss_status": _state["faiss_status"],
        "lightrag_status": _state["lightrag_status"],
        "log_buffer": _state["log_buffer"],
    }
    try:
        await ws.send_text(json.dumps(payload))
    except Exception:
        pass

    try:
        while True:
            await ws.receive_text()
    except (WebSocketDisconnect, Exception):
        pass
    finally:
        async with _st._ws_lock:
            _st._ws_clients.discard(ws)


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=False)


def _seconds_until(iso_str: str | None) -> int | None:
    """Helper — seconds until an ISO datetime string."""
    if not iso_str:
        return None
    try:
        target = datetime.fromisoformat(iso_str.replace("Z", "+00:00"))
        delta = (target - datetime.now(timezone.utc)).total_seconds()
        return max(0, int(delta))
    except (ValueError, TypeError):
        return None

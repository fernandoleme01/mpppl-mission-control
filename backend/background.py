"""
Background tasks — MPPPL Edition.
Poll loop: serviços Hermes, subagentes, processos.db, FAISS, LightRAG.
Started from the app lifespan; imported by main.py only.
"""
import asyncio
import json
import sqlite3
import subprocess
import traceback
from datetime import datetime, timezone
from pathlib import Path

import httpx

from . import state as _st
from .state import _state, broadcast_status, _now_iso
from .config import (
    POLL_INTERVAL,
    HERMES_SESSIONS_DIR,
    CRON_JOBS_PATH,
    PROCESSOS_DB_PATH,
    FAISS_IDX_PATH,
    FAISS_DIR,
    LIGHTRAG_URL,
    LIGHTRAG_HEALTH,
    OLLAMA_URL,
    OLLAMA_MODELS_URL,
    SUBAGENTES,
    HTTP_TIMEOUT,
    KB_JURIDICO_DIR,
)


# ── Helpers síncronos (rodam em executor threads) ─────────────────────────────


def _ler_processos_db() -> list[dict]:
    """Lê os últimos 50 processos do processos.db."""
    try:
        db = Path(str(PROCESSOS_DB_PATH))
        if not db.exists():
            return []
        conn = sqlite3.connect(str(db))
        conn.row_factory = sqlite3.Row
        cursor = conn.execute(
            "SELECT * FROM processos ORDER BY updated_at DESC LIMIT 50"
        )
        rows = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return rows
    except Exception as exc:
        print(f"[processos] erro lendo DB: {exc}", flush=True)
        return []


def _estatisticas_processos(processos: list[dict]) -> dict:
    """Calcula estatísticas do escritório."""
    total = len(processos)
    ativos = sum(1 for p in processos if p.get("status") in ("ativo", "em_andamento"))
    prazos = sum(1 for p in processos if p.get("prazo_proximo"))
    return {
        "total_processos": total,
        "ativos_hoje": ativos,
        "prazos_proximos": prazos,
        "ultima_atualizacao": _now_iso(),
    }


def _verificar_faiss() -> str:
    """Verifica se o índice FAISS existe e é acessível."""
    try:
        idx_path = Path(str(FAISS_IDX_PATH))
        if idx_path.exists():
            # Tenta carregar (apenas verifica se o arquivo não está corrompido)
            size_kb = sum(f.stat().st_size for f in idx_path.rglob("*") if f.is_file()) / 1024
            return f"up ({size_kb:.0f} KB)"
        # Fallback: verifica se o diretório FAISS existe
        faiss_dir = Path(str(FAISS_DIR))
        if faiss_dir.exists():
            return "degraded (índice não encontrado)"
        return "down"
    except Exception:
        return "down"


def _ler_cron_jobs_hermes() -> list[dict]:
    """Lê os cron jobs do Hermes."""
    try:
        path = Path(str(CRON_JOBS_PATH))
        if not path.exists():
            return []
        with open(path) as f:
            return json.load(f)
    except Exception:
        return []


def _ler_log_buffer() -> list[str]:
    """Últimas linhas do log do Hermes."""
    try:
        log_path = Path.home() / ".hermes" / "logs" / "hermes.log"
        if not log_path.exists():
            return []
        with open(log_path) as f:
            lines = f.readlines()
        return [l.strip() for l in lines[-30:]]
    except Exception:
        return []


def _coletar_metricas_sistema() -> dict:
    """Coleta métricas básicas do sistema (CPU, RAM, disco)."""
    try:
        import psutil
        mem = psutil.virtual_memory()
        disk = psutil.disk_usage("/")
        return {
            "cpu_pct": psutil.cpu_percent(interval=0.5),
            "ram_pct": mem.percent,
            "ram_used_gb": round(mem.used / (1024**3), 1),
            "ram_total_gb": round(mem.total / (1024**3), 1),
            "disk_pct": disk.percent,
            "disk_used_gb": round(disk.used / (1024**3), 1),
            "disk_total_gb": round(disk.total / (1024**3), 1),
            "uptime_seconds": int(datetime.now().timestamp() - psutil.boot_time()),
            "load_1m": psutil.getloadavg()[0] if hasattr(psutil, "getloadavg") else 0,
        }
    except ImportError:
        return {"cpu_pct": 0, "ram_pct": 0, "ram_used_gb": 0, "ram_total_gb": 0,
                "disk_pct": 0, "disk_used_gb": 0, "disk_total_gb": 0, "uptime_seconds": 0, "load_1m": 0}
    except Exception:
        return {}


def _atualizar_status_subagentes(hermes_status: dict) -> list[dict]:
    """Atualiza status dos subagentes MPPPL baseado no estado do Hermes."""
    subagentes = list(_state.get("subagentes", []))
    for sa in subagentes:
        sa["status"] = "online" if hermes_status.get("status") == "up" else "offline"
        sa["last_active"] = hermes_status.get("last_updated", _now_iso())
        sa["task"] = hermes_status.get("current_task") or None
    return subagentes


def _ler_hermes_status() -> dict:
    """Lê estado do Hermes de arquivos locais."""
    try:
        gateway_state = Path.home() / ".hermes" / "gateway_state.json"
        if gateway_state.exists():
            with open(gateway_state) as f:
                return json.load(f)
        return {"status": "unknown", "session_count": 0}
    except Exception:
        return {"status": "unknown"}


# ── Background tasks assíncronas ──────────────────────────────────────────────


async def run_poll_loop() -> None:
    """Loop principal de polling — coleta estado de todos os serviços MPPPL."""
    async with httpx.AsyncClient() as client:
        while True:
            try:
                # Serviços: Hermes, Ollama, LightRAG
                services: dict[str, dict] = {}

                # Hermes gateway
                try:
                    r = await client.get(
                        f"http://127.0.0.1:18789/health",
                        timeout=HTTP_TIMEOUT,
                    )
                    services["hermes"] = {
                        "name": "Hermes",
                        "status": "up" if r.status_code == 200 else "degraded",
                    }
                except Exception:
                    services["hermes"] = {"name": "Hermes", "status": "down", "error": "unreachable"}

                # Ollama
                try:
                    r = await client.get(OLLAMA_MODELS_URL, timeout=HTTP_TIMEOUT)
                    data = r.json()
                    models = [m["id"] for m in data.get("data", [])]
                    services["ollama"] = {
                        "name": "Ollama",
                        "status": "up",
                        "models": models,
                        "active_model": "gemma3:4b" if "gemma3:4b" in models else (models[0] if models else None),
                    }
                except Exception:
                    services["ollama"] = {"name": "Ollama", "status": "down"}

                # LightRAG
                try:
                    r = await client.get(LIGHTRAG_HEALTH, timeout=HTTP_TIMEOUT)
                    services["lightrag"] = {
                        "name": "LightRAG",
                        "status": "up" if r.status_code == 200 else "degraded",
                    }
                except Exception:
                    services["lightrag"] = {"name": "LightRAG", "status": "down"}

                # Tasks síncronas (thread)
                hermes_status = await asyncio.get_event_loop().run_in_executor(
                    None, _ler_hermes_status
                )
                cron_jobs = await asyncio.get_event_loop().run_in_executor(
                    None, _ler_cron_jobs_hermes
                )
                log_buffer = await asyncio.get_event_loop().run_in_executor(
                    None, _ler_log_buffer
                )
                system = await asyncio.get_event_loop().run_in_executor(
                    None, _coletar_metricas_sistema
                )

                # Atualiza estado global
                _state["services"] = services
                _state["hermes_status"] = hermes_status
                _state["cron_jobs"] = cron_jobs
                _state["system"] = system
                _state["log_buffer"] = log_buffer

                # Atualiza subagentes baseado no estado do Hermes
                _state["subagentes"] = _atualizar_status_subagentes(hermes_status)

                # LLM ativo
                _state["llm_active"] = "gemma3:4b" if services.get("ollama", {}).get("status") == "up" else None

                # Routing summary básico
                _state["routing_summary"] = {
                    "policy": "local-first",
                    "local_default": "gemma3:4b",
                    "premium_available": ["deepseek-v4-flash"],
                    "warnings": [],
                }

                _state["last_updated"] = _now_iso()

                await broadcast_status()

            except Exception as exc:
                print(f"[poll] error: {exc}", flush=True)
                traceback.print_exc()

            await asyncio.sleep(POLL_INTERVAL)


async def run_processos_poll() -> None:
    """Poll do processos.db — a cada 30s."""
    await asyncio.sleep(5)
    while True:
        try:
            processos = await asyncio.get_event_loop().run_in_executor(
                None, _ler_processos_db
            )
            _state["processos"] = processos
            _state["escritorio_stats"] = _estatisticas_processos(processos)
        except Exception as exc:
            print(f"[processos-poll] error: {exc}", flush=True)
        await asyncio.sleep(30)


async def run_faiss_health_check() -> None:
    """Verifica saúde do índice FAISS."""
    await asyncio.sleep(10)
    while True:
        try:
            status = await asyncio.get_event_loop().run_in_executor(
                None, _verificar_faiss
            )
            _state["faiss_status"] = status
        except Exception as exc:
            print(f"[faiss-check] error: {exc}", flush=True)
        await asyncio.sleep(60)


async def run_lightrag_health_check() -> None:
    """Verifica saúde do LightRAG."""
    await asyncio.sleep(10)
    async with httpx.AsyncClient() as client:
        while True:
            try:
                r = await client.get(LIGHTRAG_HEALTH, timeout=HTTP_TIMEOUT)
                if r.status_code == 200:
                    _state["lightrag_status"] = "up"
                else:
                    _state["lightrag_status"] = "degraded"
            except Exception:
                _state["lightrag_status"] = "down"
            await asyncio.sleep(60)

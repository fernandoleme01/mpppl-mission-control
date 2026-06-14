"""
Shared configuration — all constants and environment-derived paths.
Import this module; do not import individual names (avoids stale references).

MPPPL — Escritório de Advocacia (Turnaround Agro, RJ, Direito Civil)
"""
import os
import shutil
from pathlib import Path

from dotenv import load_dotenv
load_dotenv(Path(__file__).parent / ".env")

# ---------------------------------------------------------------------------
# Ambiente — sobrescreva no .env local
# ---------------------------------------------------------------------------

MESH_OPERATOR = os.getenv("MESH_OPERATOR", "Fernando Lobo")
HERMES_HOME   = Path(os.getenv("HERMES_HOME", str(Path.home() / ".hermes")))
DOCUMENTS_DIR = Path(os.getenv("DOCUMENTS_DIR", str(Path.home() / "Documents")))

# ---------------------------------------------------------------------------
# Serviços locais MPPPL
# ---------------------------------------------------------------------------

# Hermes (orquestrador principal)
HERMES_SESSIONS_DIR        = HERMES_HOME / "sessions"
HERMES_GATEWAY_URL         = os.getenv("HERMES_GATEWAY_URL", "http://127.0.0.1:18789")
HERMES_GATEWAY_STATE_PATH  = HERMES_HOME / "gateway_state.json"
HERMES_GATEWAY_PID_PATH    = HERMES_HOME / "gateway.pid"
HERMES_BIN                 = Path(shutil.which("hermes") or str(HERMES_HOME / "bin" / "hermes"))
HERMES_PROFILES_DIR        = HERMES_HOME / "profiles"
HERMES_ENV_PATH            = HERMES_HOME / ".env"
CRON_JOBS_PATH             = HERMES_HOME / "cron" / "jobs.json"
SESSIONS_DB                = os.getenv("SESSIONS_DB", str(HERMES_HOME / "sessions.db"))

# LightRAG (KB jurídico vetorial — porta 9621)
LIGHTRAG_URL    = os.getenv("LIGHTRAG_URL", "http://127.0.0.1:9621")
LIGHTRAG_HEALTH = f"{LIGHTRAG_URL}/health"

# FAISS (índice de processos)
FAISS_DIR = Path(os.getenv("FAISS_DIR", str(DOCUMENTS_DIR / "automacao_rotina" / "faiss")))
FAISS_IDX_PATH = FAISS_DIR / "idx_processos"

# Processos DB (SQLite)
PROCESSOS_DB_PATH = Path(os.getenv("PROCESSOS_DB_PATH", str(HERMES_HOME / "processos.db")))

# KB jurídico (conhecimento)
KB_JURIDICO_DIR = DOCUMENTS_DIR / "kb_juridico"

# CTO agent
CTO_AGENT_DIR = HERMES_HOME / "skills" / "tech-cto-strategist"

# LLM local (Ollama — gemma3:4b)
OLLAMA_URL        = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODELS_URL = f"{OLLAMA_URL}/v1/models"

# ---------------------------------------------------------------------------
# Caminhos do ecossistema original removidos intencionalmente:
#   - MLX (Apple Silicon — não usado no setup atual)
#   - OpenViking (não usado)
#   - Screenpipe (não usado)
#   - Claude Code / Codex (não gerenciados pelo dashboard)
#   - GitHub trending / AMP / AI Maestro
# ---------------------------------------------------------------------------

# ---------------------------------------------------------------------------
# Tuning knobs
# ---------------------------------------------------------------------------

HTTP_TIMEOUT          = 3.0
POLL_INTERVAL         = 10          # seconds between background polls
BRIEF_REFRESH_HOURS   = 6
MAX_WS_CONNECTIONS    = 50
SERVICE_HISTORY_MAX   = 20

# ---------------------------------------------------------------------------
# Protocol constants
# ---------------------------------------------------------------------------

# Routing keyword sets (adaptado pros subagentes MPPPL)
ROUTINE_KEYWORDS = {
    "summarize", "summary", "status", "report", "search", "recall",
    "monitor", "health", "log", "cron", "schedule", "memory",
}
AGRO_KEYWORDS = {
    "agro", "rural", "fazenda", "safra", "cpr", "barter", "grão",
    "pecuária", "cédula", "soja", "milho", "boi",
}
RECUPERACAO_JUDICIAL_KEYWORDS = {
    "ri", "recuperação judicial", "falência", "lei 11101", "cram down",
    "plano de recuperação", "administrador judicial",
}
CIVIL_KEYWORDS = {
    "civil", "contrato", "obrigação", "responsabilidade", "indenização",
    "posse", "propriedade", "família", "sucessão",
}

# Subagentes MPPPL (12 agentes especializados)
SUBAGENTES = [
    {"id": "sia",   "name": "SIA",   "label": "Insolvência & Agro",       "model": "gemma3:4b", "tier": "specialized"},
    {"id": "sec",   "name": "SEC",   "label": "Engenharia Cível",         "model": "gemma3:4b", "tier": "specialized"},
    {"id": "spj",   "name": "SPJ",   "label": "Pesquisa & Jurimetria",    "model": "gemma3:4b", "tier": "specialized"},
    {"id": "sag",   "name": "SAG",   "label": "Auditoria de Garantias",   "model": "gemma3:4b", "tier": "specialized"},
    {"id": "sao",   "name": "SAO",   "label": "Operações & Monitoramento","model": "gemma3:4b", "tier": "routine"},
    {"id": "aos",   "name": "AOS",   "label": "Orquestrador Sênior",      "model": "deepseek-v4-flash", "tier": "premium"},
    {"id": "sentinela",  "name": "Sentinela",  "label": "Triagem de Andamentos", "model": "gemma3:4b", "tier": "routine"},
    {"id": "pesq-jurid", "name": "PesqJurid",  "label": "Pesquisa Jurídica",      "model": "gemma3:4b", "tier": "specialized"},
    {"id": "pesq-proc",  "name": "PesqProc",   "label": "Pesquisa Processual",    "model": "gemma3:4b", "tier": "specialized"},
    {"id": "mont-brief", "name": "MontBrief",  "label": "Montagem de Briefing",   "model": "gemma3:4b", "tier": "routine"},
    {"id": "redigir",    "name": "Redigir",    "label": "Redação de Manifestações","model": "deepseek-v4-flash", "tier": "premium"},
    {"id": "revisao",    "name": "Revisao",    "label": "Revisão Estratégica",    "model": "deepseek-v4-flash", "tier": "premium"},
]

# Módulos de prática
MODULOS = [
    {"id": "agro",    "label": "Agro",          "cor": "#2ecc71"},
    {"id": "rj",      "label": "Rec. Judicial", "cor": "#e74c3c"},
    {"id": "civil",   "label": "Direito Civil", "cor": "#3498db"},
    {"id": "geral",   "label": "Geral",         "cor": "#9b59b6"},
]

# Portas mesh para verificação de segurança
MESH_PORTS = [
    ("hermes",    18789),
    ("lightrag",   9621),
    ("ollama",   11434),
]

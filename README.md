# MPPPL Mission Control

**Painel em tempo real para o ecossistema de agentes jurídicos MPPPL.**

Mesh-first dashboard construído sobre React 19 + FastAPI + WebSockets. Um comando para rodar. 100% local. Sem cloud, sem API keys.

![MPPPL Mission Control](assets/dashboard-full.png)

---

## O que monitora

- **12 subagentes especializados** — SIA (Insolvência & Agro), SEC (Engenharia Cível), SPJ (Pesquisa & Jurimetria), SAG (Auditoria de Garantias), SAO (Operações), AOS (Orquestrador), Sentinela (Triagem), PesqJurid, PesqProc, MontBrief, Redigir, Revisao
- **Hermes Agent** — status do orquestrador, sessões, cron jobs
- **LightRAG** — KB jurídico vetorial (porta 9621)
- **FAISS** — índice de processos
- **Processos DB** — últimos processos ativos com status e prazos
- **Sistema** — CPU, RAM, disco
- **Módulos de prática** — Agro, Recuperação Judicial, Direito Civil, Geral

---

## Stack

| Camada | Tech |
|--------|------|
| Frontend | React 19, Vite, TypeScript, Zustand |
| Backend | FastAPI, uvicorn, WebSockets |
| LLM local | Ollama (gemma3:4b) + DeepSeek via Hermes |
| Deploy | Docker Compose ou manual |

---

## Quick Start

```bash
git clone https://github.com/fernadolobo/mpppl-mission-control
cd mpppl-mission-control
docker-compose up --build
```

- Dashboard: http://localhost:3000
- Backend API: http://localhost:8000
- WebSocket: `ws://localhost:8000/ws`

---

## Setup Manual

**Backend:**
```bash
cd backend
cp .env.example .env   # edite com seus caminhos
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## API

```
GET  /api/status         — Estado completo do dashboard
GET  /api/agents         — Agentes + subagentes MPPPL
GET  /api/hermes         — Status do Hermes
GET  /api/system         — CPU, RAM, disco
GET  /api/cron           — Cron jobs
GET  /api/memory         — LightRAG + FAISS health
GET  /api/routing        — Roteamento e módulos
GET  /api/subagentes/:id — Detalhes de um subagente
WS   /ws                 — WebSocket de atualizações em tempo real
```

---

## Arquitetura

```
┌─────────────────────────────────────────────────┐
│                 MPPPL Dashboard                  │
│  React 19 + Vite + Tailwind + Zustand  :3000     │
├─────────────────────────────────────────────────┤
│                                                    │
│  FastAPI + WebSockets  :8000                       │
│  ┌─────────────┬──────────────┬──────────────┐    │
│  │ Poll Loop   │ Processos DB │ FAISS Health │    │
│  │ (10s)       │ (30s)        │ (60s)        │    │
│  ├─────────────┼──────────────┼──────────────┤    │
│  │ LightRAG    │ Hermes       │ Ollama       │    │
│  │ Health (60s)│ Status (10s) │ Models (10s) │    │
│  └─────────────┴──────────────┴──────────────┘    │
└─────────────────────────────────────────────────┘
```

---

## Integração com o ecossistema MPPPL

O dashboard espera encontrar:

| Serviço | Porta | Função |
|---------|-------|--------|
| Hermes Agent | 18789 | Orquestrador de agentes |
| LightRAG | 9621 | KB jurídico vetorial |
| Ollama | 11434 | LLM local (gemma3:4b) |
| FAISS | — | Índice de documentos (arquivos locais) |
| processos.db | — | Banco de processos SQLite |

**Subagentes:** O dashboard detecta automaticamente os 12 subagentes MPPPL dos skills do Hermes e os exibe no dock lateral com status em tempo real.

---

## Segurança

- **100% local** — nenhum dado sai da sua máquina
- **Sem chaves de API** — não precisa de cloud
- **.env ignorado** — configurações locais nunca vão pro repositório
- **CORS aberto** apenas para uso local (127.0.0.1)

---

## Licença

MIT — construído a partir do [iriseye931-ai/mission-control-dashboard](https://github.com/iriseye931-ai/mission-control-dashboard)

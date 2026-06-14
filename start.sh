#!/bin/bash
# MPPPL Mission Control — Start Script
# Uso: ./start.sh [backend|frontend|all]

DIR="$(cd "$(dirname "$0")" && pwd)"

start_backend() {
  echo "🚀 Starting MPPPL Backend on :8000..."
  cd "$DIR/backend"
  source "$DIR/venv/bin/activate"
  uvicorn main:app --reload --host 127.0.0.1 --port 8000
}

start_frontend() {
  echo "🚀 Starting MPPPL Frontend on :3000..."
  cd "$DIR/frontend"
  npm run dev
}

case "${1:-all}" in
  backend)
    start_backend
    ;;
  frontend)
    start_frontend
    ;;
  all)
    # Start backend in background, then frontend
    start_backend &
    sleep 2
    start_frontend
    ;;
  *)
    echo "Usage: ./start.sh [backend|frontend|all]"
    exit 1
    ;;
esac

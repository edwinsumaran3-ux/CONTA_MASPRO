#!/bin/sh
set -e

# Normalizar DATABASE_URL a formato asyncpg si viene como postgres:// o postgresql://
if [ -n "$DATABASE_URL" ]; then
  case "$DATABASE_URL" in
    postgres://*) DATABASE_URL="postgresql+asyncpg://${DATABASE_URL#postgres://}" ;;
    postgresql://*) DATABASE_URL="postgresql+asyncpg://${DATABASE_URL#postgresql://}" ;;
  esac
  export DATABASE_URL
fi

echo "DATABASE_URL scheme: $(echo $DATABASE_URL | cut -d: -f1)"
echo "Running Alembic migrations..."
alembic upgrade head

echo "Starting uvicorn..."
exec uvicorn src.main:app --host 0.0.0.0 --port "${PORT:-8000}"

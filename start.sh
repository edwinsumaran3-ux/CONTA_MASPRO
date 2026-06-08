#!/bin/sh
set -e

echo "=== CONTA_PRO startup ==="

# Strip carriage returns and trim whitespace from DATABASE_URL (Windows CRLF issue)
DATABASE_URL=$(printf '%s' "${DATABASE_URL}" | tr -d '\r\n')
export DATABASE_URL

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set."
  exit 1
fi

echo "DATABASE_URL prefix: $(echo "$DATABASE_URL" | cut -c1-30)"

# Normalize scheme for asyncpg
case "$DATABASE_URL" in
  postgres://*) DATABASE_URL="postgresql+asyncpg://${DATABASE_URL#postgres://}" ;;
  postgresql://*) DATABASE_URL="postgresql+asyncpg://${DATABASE_URL#postgresql://}" ;;
esac
export DATABASE_URL

echo "Running Alembic migrations..."
alembic upgrade head
echo "Migrations complete."

echo "Starting uvicorn on port ${PORT:-8000}..."
exec uvicorn src.main:app --host 0.0.0.0 --port "${PORT:-8000}"

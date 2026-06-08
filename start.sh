#!/bin/sh
set -e

echo "=== CONTA_PRO startup ==="

# Validate DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set. Add it in Railway variables."
  exit 1
fi

FIRST30=$(echo "$DATABASE_URL" | cut -c1-30)
echo "DATABASE_URL prefix: $FIRST30"

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

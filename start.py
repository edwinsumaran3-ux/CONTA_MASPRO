"""CONTA_PRO startup: normaliza DATABASE_URL, corre migraciones, inicia uvicorn."""
import os
import subprocess
import sys


def fix_db_url(url: str) -> str:
    url = url.strip()
    if url.startswith("postgres://"):
        return "postgresql+asyncpg://" + url[len("postgres://"):]
    if url.startswith("postgresql://"):
        return "postgresql+asyncpg://" + url[len("postgresql://"):]
    return url


def main() -> None:
    db_url = os.environ.get("DATABASE_URL", "").strip()
    if not db_url:
        print("ERROR: DATABASE_URL no esta configurado.", file=sys.stderr)
        sys.exit(1)

    db_url = fix_db_url(db_url)
    os.environ["DATABASE_URL"] = db_url
    print(f"=== CONTA_PRO startup === DATABASE_URL scheme: {db_url.split(':')[0]}")

    print("Corriendo migraciones Alembic...")
    subprocess.run([sys.executable, "-m", "alembic", "upgrade", "head"], check=True)
    print("Migraciones completas.")

    port = os.environ.get("PORT", "8000")
    print(f"Iniciando uvicorn en puerto {port}...")
    os.execv(
        sys.executable,
        [sys.executable, "-m", "uvicorn", "src.main:app",
         "--host", "0.0.0.0", "--port", port],
    )


if __name__ == "__main__":
    main()

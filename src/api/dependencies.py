# =============================================================================
#  src/api/dependencies.py
#  EDITAR — reemplaza el archivo completo
#
#  Cambio único: leer "plan" del payload del token y exponerlo
#  en el dict de contexto que reciben todos los endpoints.
# =============================================================================

from __future__ import annotations

from uuid import uuid4

from fastapi import Depends, Header, HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from src.infrastructure.db.session import get_session
from src.infrastructure.security.auth import TokenService
from src.infrastructure.security.tenant_context import set_request_context

bearer = HTTPBearer(auto_error=False)


async def get_current_context(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
    x_tenant_id: str | None = Header(default=None, alias="X-Tenant-Id"),
    x_trace_id: str | None = Header(default=None, alias="X-Trace-Id"),
) -> dict:
    trace_id = x_trace_id or str(uuid4())

    if not credentials:
        raise HTTPException(status_code=401, detail="Missing bearer token")

    try:
        payload = TokenService().verify_access_token(credentials.credentials)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    # JWT is the source of truth for tenant; X-Tenant-Id header is informational only.
    # Checking the header caused race-condition 403s when the React state hadn't
    # settled yet (company selected but store not yet updated when header was sent).
    tenant_id = payload.get("tenant_id")
    if not tenant_id:
        raise HTTPException(status_code=403, detail="No tenant in token")

    set_request_context(tenant_id, payload.get("sub"), trace_id)

    return {
        "tenant_id": tenant_id,
        "user_id":   payload.get("sub"),
        "role":      payload.get("role"),
        "plan":      payload.get("plan", "BASIC"),   # ← NUEVO campo
        "trace_id":  trace_id,
    }


async def get_db(session: AsyncSession = Depends(get_session)) -> AsyncSession:
    return session


def require_roles(*allowed_roles: str):
    """
    Dependencia para verificar roles.
    Uso: ctx = Depends(require_roles("ADMIN", "CONTROLLER"))
    """
    async def checker(ctx: dict = Depends(get_current_context)) -> dict:
        role = ctx.get("role")
        if allowed_roles and role != "SUPER_ADMIN" and role not in allowed_roles:
            raise HTTPException(status_code=403, detail="Insufficient role")
        return ctx
    return checker


def require_company_access(company_id: str | None, ctx: dict) -> None:
    """ABAC hook: verifica scope de empresa desde claims del token."""
    if (
        company_id
        and ctx.get("company_id")
        and company_id != ctx["company_id"]
    ):
        raise HTTPException(status_code=403, detail="Company scope mismatch")

from src.plan_features import PLAN_FEATURES
from fastapi import HTTPException

def require_feature(ctx: dict, feature: str):
    plan = ctx.get("plan", "BASIC")
    allowed = PLAN_FEATURES.get(plan, {}).get(feature, False)

    if not allowed:
        raise HTTPException(
            status_code=403,
            detail=f"Funcion disponible en un plan superior. Plan actual: {plan}"
        )

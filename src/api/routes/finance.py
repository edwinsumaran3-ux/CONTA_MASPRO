from datetime import date as date_type
from decimal import Decimal
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy import select, text

from src.api.dependencies import require_roles
from src.application.services.treasury_service import TreasuryService
from src.api.routes.ledger import build_hash_service, build_uow_factory
from src.application.services.ledger_posting_service import LedgerPostingService
from src.domain.models.accounting import FinancialDocument, TreasuryAccount, TreasuryMovement
from src.infrastructure.db.session import AsyncSessionLocal
from src.infrastructure.unit_of_work import UnitOfWork

router = APIRouter(prefix="/finance", tags=["Core Finance"])


class ProvisionRequest(BaseModel):
    tenant_id: str
    company_id: str | None = None
    year: int
    month: int
    amount: Decimal
    description: str
    debit_account: str
    credit_account: str
    cost_center: str | None = None


class DepreciationRequest(BaseModel):
    tenant_id: str
    company_id: str | None = None
    year: int
    month: int
    amount: Decimal
    asset_code: str
    expense_account: str = "681"
    accumulated_account: str = "391"
    cost_center: str | None = None


class FxDifferenceRequest(BaseModel):
    tenant_id: str
    company_id: str | None = None
    year: int
    month: int
    amount: Decimal
    source_account: str
    gain: bool
    partner_ruc: str | None = None
    document_series: str | None = None
    document_number: str | None = None


class AnnualCloseRequest(BaseModel):
    tenant_id: str
    company_id: str | None = None
    fiscal_year: int
    profit_or_loss: Decimal
    retained_earnings_account: str = "591"
    result_account: str = "891"


class ArPaymentRequest(BaseModel):
    tenant_id: str
    series: str
    number: str
    amount: Decimal
    treasury_account_id: str
    reference: str | None = None


class ApPaymentRequest(BaseModel):
    tenant_id: str
    series: str
    number: str
    amount: Decimal
    treasury_account_id: str
    reference: str | None = None


class TreasuryReconcileRequest(BaseModel):
    tenant_id: str
    movement_ids: list[str]


class TreasuryStatementImportRequest(BaseModel):
    tenant_id: str
    treasury_account_id: str
    csv_content: str
    default_currency: str = "PEN"


class TreasuryAutoMatchRequest(BaseModel):
    tenant_id: str
    limit: int = 200


async def _post(payload: dict, request: Request, ctx: dict):
    if payload["tenant_id"] != ctx["tenant_id"]:
        raise HTTPException(status_code=403, detail="Tenant mismatch")
    payload["trace_id"] = ctx["trace_id"]
    payload["user_id"] = ctx["user_id"]
    payload["ip_address"] = request.client.host if request.client else None
    payload["user_agent"] = request.headers.get("user-agent")
    entry = await LedgerPostingService(build_uow_factory(), build_hash_service()).post_journal(payload)
    return {
        "entry_id": str(entry.id),
        "row_hash": entry.row_hash,
        "previous_hash": entry.previous_hash,
        "total_debit": str(entry.total_debit),
        "total_credit": str(entry.total_credit),
    }


@router.post("/provisions")
async def post_provision(payload: ProvisionRequest, request: Request, ctx=Depends(require_roles("ADMIN", "CONTROLLER", "ACCOUNTANT"))):
    return await _post({
        **payload.model_dump(),
        "description": payload.description,
        "source_module": "PROVISIONS",
        "source_id": f"provision:{payload.year}-{payload.month}:{payload.description}",
        "currency": "PEN",
        "lines": [
            {"account_code": payload.debit_account, "account_name": "Provision expense", "debit": payload.amount, "credit": Decimal("0.00"), "cost_center": payload.cost_center},
            {"account_code": payload.credit_account, "account_name": "Provision liability", "debit": Decimal("0.00"), "credit": payload.amount, "cost_center": payload.cost_center},
        ],
    }, request, ctx)


@router.post("/fixed-assets/depreciation")
async def post_depreciation(payload: DepreciationRequest, request: Request, ctx=Depends(require_roles("ADMIN", "CONTROLLER", "ACCOUNTANT"))):
    return await _post({
        **payload.model_dump(),
        "description": f"Depreciacion activo {payload.asset_code}",
        "source_module": "FIXED_ASSETS",
        "source_id": f"depreciation:{payload.asset_code}:{payload.year}-{payload.month}",
        "currency": "PEN",
        "lines": [
            {"account_code": payload.expense_account, "account_name": "Depreciation expense", "debit": payload.amount, "credit": Decimal("0.00"), "cost_center": payload.cost_center},
            {"account_code": payload.accumulated_account, "account_name": "Accumulated depreciation", "debit": Decimal("0.00"), "credit": payload.amount, "cost_center": payload.cost_center},
        ],
    }, request, ctx)


@router.post("/currency/fx-difference")
async def post_fx_difference(payload: FxDifferenceRequest, request: Request, ctx=Depends(require_roles("ADMIN", "CONTROLLER", "ACCOUNTANT", "TREASURY"))):
    result_account = "776" if payload.gain else "676"
    lines = [
        {"account_code": payload.source_account, "account_name": "Foreign currency source", "debit": payload.amount if payload.gain else Decimal("0.00"), "credit": Decimal("0.00") if payload.gain else payload.amount, "partner_ruc": payload.partner_ruc, "document_series": payload.document_series, "document_number": payload.document_number},
        {"account_code": result_account, "account_name": "FX gain" if payload.gain else "FX loss", "debit": Decimal("0.00") if payload.gain else payload.amount, "credit": payload.amount if payload.gain else Decimal("0.00"), "partner_ruc": payload.partner_ruc, "document_series": payload.document_series, "document_number": payload.document_number},
    ]
    return await _post({
        **payload.model_dump(),
        "description": "Diferencia de cambio ganancia" if payload.gain else "Diferencia de cambio perdida",
        "source_module": "FX_REVALUATION",
        "source_id": f"fx:{payload.source_account}:{payload.year}-{payload.month}",
        "currency": "PEN",
        "lines": lines,
    }, request, ctx)


@router.post("/annual-close")
async def post_annual_close(payload: AnnualCloseRequest, request: Request, ctx=Depends(require_roles("ADMIN", "CONTROLLER"))):
    amount = abs(payload.profit_or_loss)
    profit = payload.profit_or_loss >= 0
    lines = [
        {"account_code": payload.result_account, "account_name": "Resultado del ejercicio", "debit": amount if profit else Decimal("0.00"), "credit": Decimal("0.00") if profit else amount},
        {"account_code": payload.retained_earnings_account, "account_name": "Resultados acumulados", "debit": Decimal("0.00") if profit else amount, "credit": amount if profit else Decimal("0.00")},
    ]
    return await _post({
        "tenant_id": payload.tenant_id,
        "company_id": payload.company_id,
        "year": payload.fiscal_year,
        "month": 12,
        "description": f"Cierre anual {payload.fiscal_year}",
        "source_module": "ANNUAL_CLOSE",
        "source_id": f"annual-close:{payload.fiscal_year}",
        "currency": "PEN",
        "lines": lines,
    }, request, ctx)


@router.post("/accounts-receivable/apply-payment")
async def apply_ar_payment(payload: ArPaymentRequest, ctx=Depends(require_roles("ADMIN", "TREASURY", "ACCOUNTANT"))):
    if payload.tenant_id != ctx["tenant_id"]:
        raise HTTPException(status_code=403, detail="Tenant mismatch")
    if payload.amount <= 0:
        raise HTTPException(status_code=422, detail="El monto debe ser mayor a cero")

    async with UnitOfWork(AsyncSessionLocal, payload.tenant_id) as uow:
        from sqlalchemy import select

        result = await uow.session.execute(
            select(FinancialDocument).where(
                FinancialDocument.tenant_id == payload.tenant_id,
                FinancialDocument.direction == "AR",
                FinancialDocument.series == payload.series,
                FinancialDocument.number == payload.number,
            )
        )
        document = result.scalar_one_or_none()
        if document is None:
            raise HTTPException(status_code=404, detail="Documento AR no encontrado")
        if Decimal(str(document.balance_amount)) < payload.amount:
            raise HTTPException(status_code=422, detail="Monto excede saldo del documento")

        document.balance_amount = Decimal(str(document.balance_amount)) - payload.amount
        movement = TreasuryMovement(
            id=uuid4(),
            tenant_id=payload.tenant_id,
            company_id=document.company_id,
            treasury_account_id=payload.treasury_account_id,
            movement_date=document.issue_date,
            movement_type="RECEIPT",
            amount=payload.amount,
            currency=document.currency,
            reference=payload.reference or f"Cobranza {payload.series}-{payload.number}",
            financial_document_id=document.id,
            journal_entry_id=document.journal_entry_id,
            reconciliation_status="OPEN",
        )
        uow.session.add(movement)
        await uow.commit()

        return {
            "document": f"{payload.series}-{payload.number}",
            "balance_amount": str(document.balance_amount),
            "movement_id": str(movement.id),
            "movement_type": movement.movement_type,
        }


@router.post("/accounts-payable/apply-payment")
async def apply_ap_payment(payload: ApPaymentRequest, ctx=Depends(require_roles("ADMIN", "TREASURY", "ACCOUNTANT"))):
    if payload.tenant_id != ctx["tenant_id"]:
        raise HTTPException(status_code=403, detail="Tenant mismatch")
    if payload.amount <= 0:
        raise HTTPException(status_code=422, detail="El monto debe ser mayor a cero")

    async with UnitOfWork(AsyncSessionLocal, payload.tenant_id) as uow:
        from sqlalchemy import select

        result = await uow.session.execute(
            select(FinancialDocument).where(
                FinancialDocument.tenant_id == payload.tenant_id,
                FinancialDocument.direction == "AP",
                FinancialDocument.series == payload.series,
                FinancialDocument.number == payload.number,
            )
        )
        document = result.scalar_one_or_none()
        if document is None:
            raise HTTPException(status_code=404, detail="Documento AP no encontrado")
        if Decimal(str(document.balance_amount)) < payload.amount:
            raise HTTPException(status_code=422, detail="Monto excede saldo del documento")

        document.balance_amount = Decimal(str(document.balance_amount)) - payload.amount
        movement = TreasuryMovement(
            id=uuid4(),
            tenant_id=payload.tenant_id,
            company_id=document.company_id,
            treasury_account_id=payload.treasury_account_id,
            movement_date=document.issue_date,
            movement_type="PAYMENT",
            amount=payload.amount,
            currency=document.currency,
            reference=payload.reference or f"Pago {payload.series}-{payload.number}",
            financial_document_id=document.id,
            journal_entry_id=document.journal_entry_id,
            reconciliation_status="OPEN",
        )
        uow.session.add(movement)
        await uow.commit()

        return {
            "document": f"{payload.series}-{payload.number}",
            "balance_amount": str(document.balance_amount),
            "movement_id": str(movement.id),
            "movement_type": movement.movement_type,
        }


@router.post("/treasury/reconcile")
async def reconcile_treasury(payload: TreasuryReconcileRequest, ctx=Depends(require_roles("ADMIN", "TREASURY", "ACCOUNTANT"))):
    if payload.tenant_id != ctx["tenant_id"]:
        raise HTTPException(status_code=403, detail="Tenant mismatch")

    async with UnitOfWork(AsyncSessionLocal, payload.tenant_id) as uow:
        from sqlalchemy import select

        result = await uow.session.execute(
            select(TreasuryMovement).where(
                TreasuryMovement.tenant_id == payload.tenant_id,
                TreasuryMovement.id.in_(payload.movement_ids),
            )
        )
        movements = list(result.scalars().all())
        for movement in movements:
            movement.reconciliation_status = "RECONCILED"
        await uow.commit()

        return {"reconciled": len(movements), "movement_ids": [str(m.id) for m in movements]}


@router.post("/treasury/import-statement")
async def import_statement(payload: TreasuryStatementImportRequest, ctx=Depends(require_roles("ADMIN", "TREASURY", "ACCOUNTANT"))):
    if payload.tenant_id != ctx["tenant_id"]:
        raise HTTPException(status_code=403, detail="Tenant mismatch")

    service = TreasuryService(lambda tenant_id: UnitOfWork(AsyncSessionLocal, tenant_id))
    result = await service.import_statement_csv(
        payload.tenant_id,
        treasury_account_id=payload.treasury_account_id,
        csv_content=payload.csv_content,
        default_currency=payload.default_currency,
    )
    return {"imported": result.imported, "rejected": result.rejected}


@router.post("/treasury/auto-match")
async def auto_match_statement(payload: TreasuryAutoMatchRequest, ctx=Depends(require_roles("ADMIN", "TREASURY", "ACCOUNTANT"))):
    if payload.tenant_id != ctx["tenant_id"]:
        raise HTTPException(status_code=403, detail="Tenant mismatch")

    service = TreasuryService(lambda tenant_id: UnitOfWork(AsyncSessionLocal, tenant_id))
    result = await service.auto_match_open_items(payload.tenant_id, limit=payload.limit)
    return {"reviewed": result.reviewed, "matched": result.matched}


# ──────────────────────────────────────────────────────────────────────────────
# TREASURY ACCOUNTS — CRUD
# ──────────────────────────────────────────────────────────────────────────────

class TreasuryAccountCreateRequest(BaseModel):
    bank_code: str
    account_number: str
    currency: str = "PEN"
    ledger_account_code: str


@router.get("/treasury/accounts")
async def list_treasury_accounts(ctx=Depends(require_roles("ADMIN", "CONTROLLER", "ACCOUNTANT", "TREASURY"))):
    """Lista cuentas bancarias y caja chica activas del tenant."""
    async with UnitOfWork(AsyncSessionLocal, ctx["tenant_id"]) as uow:
        result = await uow.session.execute(
            select(TreasuryAccount)
            .where(TreasuryAccount.tenant_id == ctx["tenant_id"], TreasuryAccount.is_active.is_(True))
            .order_by(TreasuryAccount.bank_code.asc())
        )
        rows = list(result.scalars().all())
        return [
            {
                "id": str(row.id),
                "bank_code": row.bank_code,
                "account_number": row.account_number,
                "currency": row.currency,
                "ledger_account_code": row.ledger_account_code,
                "current_balance": str(row.current_balance),
                "created_at": row.created_at.isoformat(),
            }
            for row in rows
        ]


@router.post("/treasury/accounts")
async def create_treasury_account(
    payload: TreasuryAccountCreateRequest,
    ctx=Depends(require_roles("ADMIN", "CONTROLLER", "ACCOUNTANT")),
):
    """Crea una cuenta bancaria o de caja chica para el tenant."""
    async with UnitOfWork(AsyncSessionLocal, ctx["tenant_id"]) as uow:
        account = TreasuryAccount(
            id=uuid4(),
            tenant_id=ctx["tenant_id"],
            bank_code=payload.bank_code,
            account_number=payload.account_number,
            currency=payload.currency,
            ledger_account_code=payload.ledger_account_code,
            current_balance=Decimal("0"),
            is_active=True,
        )
        uow.session.add(account)
        await uow.commit()
        return {
            "id": str(account.id),
            "bank_code": account.bank_code,
            "account_number": account.account_number,
            "currency": account.currency,
            "current_balance": "0",
        }


# ──────────────────────────────────────────────────────────────────────────────
# TREASURY MOVEMENTS — lista y registro manual
# ──────────────────────────────────────────────────────────────────────────────

class ManualMovementRequest(BaseModel):
    treasury_account_id: str
    movement_date: str          # ISO date YYYY-MM-DD
    movement_type: str          # INCOME | EXPENSE | RECEIPT | PAYMENT | TRANSFER_IN | TRANSFER_OUT | PETTY_CASH
    amount: Decimal
    currency: str = "PEN"
    reference: str | None = None
    partner_ruc: str | None = None


@router.get("/treasury/movements")
async def list_treasury_movements(
    account_id: str | None = None,
    limit: int = 100,
    ctx=Depends(require_roles("ADMIN", "CONTROLLER", "ACCOUNTANT", "TREASURY")),
):
    """
    Lista movimientos de tesorería.
    Cruce rápido con business_partners para mostrar nombre del proveedor/cliente.
    Cruce con financial_documents para mostrar documento origen.
    """
    async with UnitOfWork(AsyncSessionLocal, ctx["tenant_id"]) as uow:
        q = select(TreasuryMovement).where(TreasuryMovement.tenant_id == ctx["tenant_id"])
        if account_id:
            q = q.where(TreasuryMovement.treasury_account_id == account_id)
        q = q.order_by(TreasuryMovement.movement_date.desc()).limit(limit)
        result = await uow.session.execute(q)
        rows = list(result.scalars().all())

        # Batch-load partner names
        partner_ids = list({str(r.partner_id) for r in rows if r.partner_id})
        partners: dict[str, str] = {}
        if partner_ids:
            pr = await uow.session.execute(
                text(
                    "SELECT id::text, legal_name FROM business_partners "
                    "WHERE tenant_id = :tid AND id::text = ANY(:ids)"
                ),
                {"tid": ctx["tenant_id"], "ids": partner_ids},
            )
            partners = {row[0]: row[1] for row in pr.fetchall()}

        # Batch-load document references (series-number)
        doc_ids = list({str(r.financial_document_id) for r in rows if r.financial_document_id})
        docs: dict[str, str] = {}
        if doc_ids:
            dr = await uow.session.execute(
                text(
                    "SELECT id::text, series || '-' || number AS ref "
                    "FROM financial_documents "
                    "WHERE tenant_id = :tid AND id::text = ANY(:ids)"
                ),
                {"tid": ctx["tenant_id"], "ids": doc_ids},
            )
            docs = {row[0]: row[1] for row in dr.fetchall()}

        return [
            {
                "id": str(row.id),
                "treasury_account_id": str(row.treasury_account_id),
                "movement_date": str(row.movement_date),
                "movement_type": row.movement_type,
                "amount": str(row.amount),
                "currency": row.currency,
                "reference": row.reference,
                "partner_name": partners.get(str(row.partner_id)) if row.partner_id else None,
                "document_ref": docs.get(str(row.financial_document_id)) if row.financial_document_id else None,
                "journal_entry_id": str(row.journal_entry_id) if row.journal_entry_id else None,
                "reconciliation_status": row.reconciliation_status,
                "created_at": row.created_at.isoformat(),
            }
            for row in rows
        ]


@router.post("/treasury/movements")
async def register_manual_movement(
    payload: ManualMovementRequest,
    ctx=Depends(require_roles("ADMIN", "CONTROLLER", "ACCOUNTANT", "TREASURY")),
):
    """
    Registra un movimiento manual de tesorería.
    Actualiza el saldo de la cuenta automáticamente.
    Cruza con business_partners por RUC si se proporciona.
    """
    async with UnitOfWork(AsyncSessionLocal, ctx["tenant_id"]) as uow:
        acc_res = await uow.session.execute(
            select(TreasuryAccount).where(
                TreasuryAccount.id == payload.treasury_account_id,
                TreasuryAccount.tenant_id == ctx["tenant_id"],
            )
        )
        account = acc_res.scalar_one_or_none()
        if account is None:
            raise HTTPException(status_code=404, detail="Cuenta de tesorería no encontrada")

        partner_id = None
        if payload.partner_ruc:
            p_res = await uow.session.execute(
                text(
                    "SELECT id FROM business_partners "
                    "WHERE tenant_id = :tid AND document_number = :ruc LIMIT 1"
                ),
                {"tid": ctx["tenant_id"], "ruc": payload.partner_ruc},
            )
            p_row = p_res.fetchone()
            if p_row:
                partner_id = p_row[0]

        movement = TreasuryMovement(
            id=uuid4(),
            tenant_id=ctx["tenant_id"],
            treasury_account_id=payload.treasury_account_id,
            movement_date=date_type.fromisoformat(payload.movement_date),
            movement_type=payload.movement_type,
            amount=payload.amount,
            currency=payload.currency,
            reference=payload.reference,
            partner_id=partner_id,
            reconciliation_status="OPEN",
        )
        uow.session.add(movement)

        # Actualizar saldo de la cuenta
        bal = Decimal(str(account.current_balance))
        if payload.movement_type in ("INCOME", "RECEIPT", "TRANSFER_IN"):
            account.current_balance = bal + payload.amount
        elif payload.movement_type in ("EXPENSE", "PAYMENT", "TRANSFER_OUT", "PETTY_CASH"):
            account.current_balance = bal - payload.amount

        await uow.commit()
        return {
            "id": str(movement.id),
            "movement_type": movement.movement_type,
            "amount": str(movement.amount),
            "reconciliation_status": "OPEN",
            "new_balance": str(account.current_balance),
        }


# ──────────────────────────────────────────────────────────────────────────────
# TREASURY SUMMARY — cruce rápido con todas las tablas relacionadas
# ──────────────────────────────────────────────────────────────────────────────

@router.get("/treasury/summary")
async def treasury_summary(ctx=Depends(require_roles("ADMIN", "CONTROLLER", "ACCOUNTANT", "TREASURY"))):
    """
    Resumen ejecutivo de tesorería:
    - Saldo total por moneda (treasury_accounts)
    - Movimientos abiertos sin conciliar (treasury_movements)
    - Cuentas por cobrar pendientes - AR (financial_documents)
    - Cuentas por pagar pendientes - AP (financial_documents)
    """
    tid = ctx["tenant_id"]
    async with UnitOfWork(AsyncSessionLocal, tid) as uow:
        bal = await uow.session.execute(
            text("""
                SELECT currency, SUM(current_balance) AS total, COUNT(*) AS qty
                FROM treasury_accounts
                WHERE tenant_id = :tid AND is_active = true
                GROUP BY currency ORDER BY currency
            """),
            {"tid": tid},
        )
        balances = [{"currency": r[0], "total": str(r[1]), "accounts": r[2]} for r in bal.fetchall()]

        open_mv = await uow.session.execute(
            text("SELECT COUNT(*) FROM treasury_movements WHERE tenant_id = :tid AND reconciliation_status = 'OPEN'"),
            {"tid": tid},
        )

        ar = await uow.session.execute(
            text("""
                SELECT COUNT(*), COALESCE(SUM(balance_amount), 0)
                FROM financial_documents
                WHERE tenant_id = :tid AND direction = 'AR' AND balance_amount > 0
            """),
            {"tid": tid},
        )
        ar_row = ar.fetchone()

        ap = await uow.session.execute(
            text("""
                SELECT COUNT(*), COALESCE(SUM(balance_amount), 0)
                FROM financial_documents
                WHERE tenant_id = :tid AND direction = 'AP' AND balance_amount > 0
            """),
            {"tid": tid},
        )
        ap_row = ap.fetchone()

        return {
            "balances": balances,
            "open_movements": open_mv.scalar() or 0,
            "ar_pending_count": ar_row[0] if ar_row else 0,
            "ar_pending_amount": str(ar_row[1]) if ar_row else "0",
            "ap_pending_count": ap_row[0] if ap_row else 0,
            "ap_pending_amount": str(ap_row[1]) if ap_row else "0",
        }


# ──────────────────────────────────────────────────────────────────────────────
# TREASURY DELETE — eliminar cuentas y movimientos
# ──────────────────────────────────────────────────────────────────────────────

@router.delete("/treasury/movements/{movement_id}")
async def delete_treasury_movement(
    movement_id: str,
    ctx=Depends(require_roles("ADMIN", "CONTROLLER", "ACCOUNTANT")),
):
    """Elimina un movimiento de tesorería y revierte el saldo de la cuenta."""
    async with UnitOfWork(AsyncSessionLocal, ctx["tenant_id"]) as uow:
        res = await uow.session.execute(
            select(TreasuryMovement).where(
                TreasuryMovement.id == movement_id,
                TreasuryMovement.tenant_id == ctx["tenant_id"],
            )
        )
        movement = res.scalar_one_or_none()
        if movement is None:
            raise HTTPException(status_code=404, detail="Movimiento no encontrado")

        # Revertir saldo en la cuenta
        acc_res = await uow.session.execute(
            select(TreasuryAccount).where(TreasuryAccount.id == str(movement.treasury_account_id))
        )
        account = acc_res.scalar_one_or_none()
        if account:
            bal = Decimal(str(account.current_balance))
            if movement.movement_type in ("INCOME", "RECEIPT", "TRANSFER_IN"):
                account.current_balance = bal - movement.amount
            elif movement.movement_type in ("EXPENSE", "PAYMENT", "TRANSFER_OUT", "PETTY_CASH"):
                account.current_balance = bal + movement.amount

        await uow.session.delete(movement)
        await uow.commit()
        return {"deleted": movement_id}


@router.delete("/treasury/accounts/{account_id}")
async def delete_treasury_account(
    account_id: str,
    ctx=Depends(require_roles("ADMIN", "CONTROLLER", "ACCOUNTANT")),
):
    """Elimina una cuenta de tesorería y todos sus movimientos."""
    async with UnitOfWork(AsyncSessionLocal, ctx["tenant_id"]) as uow:
        acc_res = await uow.session.execute(
            select(TreasuryAccount).where(
                TreasuryAccount.id == account_id,
                TreasuryAccount.tenant_id == ctx["tenant_id"],
            )
        )
        account = acc_res.scalar_one_or_none()
        if account is None:
            raise HTTPException(status_code=404, detail="Cuenta no encontrada")

        # Eliminar movimientos asociados primero
        await uow.session.execute(
            text("DELETE FROM treasury_movements WHERE treasury_account_id = :aid AND tenant_id = :tid"),
            {"aid": account_id, "tid": ctx["tenant_id"]},
        )
        await uow.session.delete(account)
        await uow.commit()
        return {"deleted": account_id, "movements_deleted": True}


@router.delete("/treasury/clear-all")
async def clear_all_treasury_data(ctx=Depends(require_roles("ADMIN", "CONTROLLER"))):
    """Elimina TODOS los movimientos y cuentas de tesorería del tenant."""
    tid = ctx["tenant_id"]
    async with UnitOfWork(AsyncSessionLocal, tid) as uow:
        mv_res = await uow.session.execute(
            text("DELETE FROM treasury_movements WHERE tenant_id = :tid RETURNING id"),
            {"tid": tid},
        )
        acc_res = await uow.session.execute(
            text("DELETE FROM treasury_accounts WHERE tenant_id = :tid RETURNING id"),
            {"tid": tid},
        )
        await uow.commit()
        return {
            "movements_deleted": len(mv_res.fetchall()),
            "accounts_deleted": len(acc_res.fetchall()),
        }


@router.delete("/dev/purge-test-data")
async def purge_all_test_data(ctx=Depends(require_roles("ADMIN"))):
    """Purga TODOS los datos de prueba: journal, kardex, warehouse. Solo ADMIN."""
    tenant_id = ctx["tenant_id"]
    results = {}

    # Paso 1: Patch función anti-delete para permitir bypass por sesión
    bypass_patch = """
CREATE OR REPLACE FUNCTION prevent_immutable_mutation()
RETURNS TRIGGER AS $$
BEGIN
  IF current_setting('app.allow_admin_delete', true) = 'true' THEN
    RETURN OLD;
  END IF;
  RAISE EXCEPTION 'Registro inmutable. Operación no permitida.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
"""
    try:
        async with AsyncSessionLocal() as s:
            await s.execute(text(bypass_patch))
            await s.commit()
        results["patch_fn"] = "ok"
    except Exception as e:
        results["patch_fn"] = f"ERROR: {e}"

    # Paso 2: DELETE journal en una sesión con bypass y tenant RLS
    try:
        async with AsyncSessionLocal() as s:
            await s.execute(text("SELECT set_config('app.current_tenant', :t, true)"), {"t": tenant_id})
            await s.execute(text("SELECT set_config('app.allow_admin_delete', 'true', true)"))
            r1 = await s.execute(text("DELETE FROM journal_lines WHERE entry_id IN (SELECT id FROM journal_entries WHERE tenant_id=CAST(:t AS uuid))"), {"t": tenant_id})
            r2 = await s.execute(text("DELETE FROM journal_entries WHERE tenant_id=CAST(:t AS uuid)"), {"t": tenant_id})
            await s.commit()
        results["journal"] = f"lines={r1.rowcount} entries={r2.rowcount}"
    except Exception as e:
        results["journal"] = f"ERROR: {e}"

    # Paso 3: DELETE kardex + inventory_balances + warehouses + financial_documents
    try:
        async with AsyncSessionLocal() as s:
            await s.execute(text("SELECT set_config('app.current_tenant', :t, true)"), {"t": tenant_id})
            r3 = await s.execute(text("DELETE FROM kardex_movements WHERE tenant_id=CAST(:t AS uuid)"), {"t": tenant_id})
            r3b = await s.execute(text("DELETE FROM inventory_balances WHERE warehouse_id IN (SELECT id FROM warehouses WHERE tenant_id=CAST(:t AS uuid))"), {"t": tenant_id})
            r4 = await s.execute(text("DELETE FROM warehouses WHERE tenant_id=CAST(:t AS uuid)"), {"t": tenant_id})
            r5 = await s.execute(text("DELETE FROM financial_documents WHERE tenant_id=CAST(:t AS uuid)"), {"t": tenant_id})
            await s.commit()
        results["inventory_docs"] = f"kardex={r3.rowcount} inv_balances={r3b.rowcount} warehouses={r4.rowcount} docs={r5.rowcount}"
    except Exception as e:
        results["inventory_docs"] = f"ERROR: {e}"

    # Paso 4: Restaurar función a modo estricto
    restore_patch = """
CREATE OR REPLACE FUNCTION prevent_immutable_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Registro inmutable. Operación no permitida.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
"""
    try:
        async with AsyncSessionLocal() as s:
            await s.execute(text(restore_patch))
            await s.commit()
        results["restore_fn"] = "ok"
    except Exception as e:
        results["restore_fn"] = f"ERROR: {e}"

    return {"status": "done", "results": results}

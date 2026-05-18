"""Inspection endpoints for the event bus (F3)."""
from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import desc, func, select

from src.api.dependencies import get_current_context
from src.domain.models.accounting import DeadLetterEvent, OutboxEvent
from src.infrastructure.db.session import AsyncSessionLocal
from src.infrastructure.events.dispatcher import get_dispatcher

router = APIRouter(prefix="/events", tags=["Event Bus"])


@router.get("/outbox")
async def list_outbox(
    status: str | None = Query(None, description="PENDING|SENT|FAILED"),
    topic: str | None = None,
    limit: int = 50,
    ctx=Depends(get_current_context),
):
    tenant_id = ctx["tenant_id"]
    async with AsyncSessionLocal() as session:
        stmt = (
            select(OutboxEvent)
            .where(OutboxEvent.tenant_id == tenant_id)
            .order_by(desc(OutboxEvent.created_at))
            .limit(limit)
        )
        if status:
            stmt = stmt.where(OutboxEvent.status == status.upper())
        if topic:
            stmt = stmt.where(OutboxEvent.topic == topic)
        rows = (await session.execute(stmt)).scalars().all()
        return [
            {
                "id": str(r.id),
                "topic": r.topic,
                "aggregate_id": r.aggregate_id,
                "status": r.status,
                "attempts": r.attempts,
                "max_attempts": r.max_attempts,
                "next_retry_at": r.next_retry_at.isoformat() if r.next_retry_at else None,
                "last_error": r.last_error,
                "created_at": r.created_at.isoformat() if r.created_at else None,
                "processed_at": r.processed_at.isoformat() if r.processed_at else None,
            }
            for r in rows
        ]


@router.get("/dead-letter")
async def list_dead_letter(limit: int = 50, ctx=Depends(get_current_context)):
    tenant_id = ctx["tenant_id"]
    async with AsyncSessionLocal() as session:
        stmt = (
            select(DeadLetterEvent)
            .where(DeadLetterEvent.tenant_id == tenant_id)
            .order_by(desc(DeadLetterEvent.created_at))
            .limit(limit)
        )
        rows = (await session.execute(stmt)).scalars().all()
        return [
            {
                "id": str(r.id),
                "source_event_id": str(r.source_event_id) if r.source_event_id else None,
                "topic": r.topic,
                "aggregate_id": r.aggregate_id,
                "reason": r.reason,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in rows
        ]


@router.get("/stats")
async def event_stats(ctx=Depends(get_current_context)):
    tenant_id = ctx["tenant_id"]
    async with AsyncSessionLocal() as session:
        stmt = (
            select(OutboxEvent.status, func.count())
            .where(OutboxEvent.tenant_id == tenant_id)
            .group_by(OutboxEvent.status)
        )
        outbox_counts = {row[0]: row[1] for row in await session.execute(stmt)}

        dl_count = (await session.execute(
            select(func.count()).select_from(DeadLetterEvent).where(DeadLetterEvent.tenant_id == tenant_id)
        )).scalar() or 0

        return {
            "outbox": outbox_counts,
            "dead_letter": dl_count,
            "dispatcher_running": get_dispatcher()._task is not None and not get_dispatcher()._task.done(),  # noqa: SLF001
            "as_of": datetime.now(timezone.utc).isoformat(),
        }


@router.post("/retry/{event_id}")
async def retry_event(event_id: str, ctx=Depends(get_current_context)):
    tenant_id = ctx["tenant_id"]
    async with AsyncSessionLocal() as session:
        stmt = select(OutboxEvent).where(OutboxEvent.id == event_id, OutboxEvent.tenant_id == tenant_id)
        event = (await session.execute(stmt)).scalar_one_or_none()
        if event is None:
            raise HTTPException(404, "Event not found")
        event.status = "PENDING"
        event.attempts = 0
        event.next_retry_at = None
        event.last_error = None
        await session.commit()
        return {"id": str(event.id), "status": event.status}

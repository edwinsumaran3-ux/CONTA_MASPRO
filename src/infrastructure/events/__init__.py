"""Event bus + outbox dispatcher (F3).

Atomic publication via `OutboxEvent` within the same DB transaction as the
business write, async dispatch with idempotency, exponential backoff retries,
and dead-letter on exhaustion.
"""

from src.infrastructure.events.event_types import EventTopic, build_event_payload
from src.infrastructure.events.dispatcher import EventDispatcher, get_dispatcher

__all__ = ["EventTopic", "build_event_payload", "EventDispatcher", "get_dispatcher"]

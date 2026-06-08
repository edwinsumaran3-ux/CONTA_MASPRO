from __future__ import annotations

"""Selecciona automáticamente el proveedor de visión IA disponible.

Orden de prioridad:
  1. Claude (Anthropic) — mejor para fotos de celular, tickets borrosos, CVs
  2. Gemini (Google)   — alternativa si solo hay clave Gemini
  3. Ninguno           — devuelve configuration_required

Ambos implementan la misma interfaz: analyze_document() y response_text().
"""

from src.config import settings
from src.infrastructure.adapters.ai.claude_client import ClaudeClient
from src.infrastructure.adapters.ai.gemini import GeminiClient


def get_vision_client() -> ClaudeClient | GeminiClient:
    """Devuelve el cliente de visión disponible según la configuración."""
    if settings.claude_api_key:
        return ClaudeClient(
            api_key=settings.claude_api_key,
            model=settings.claude_model or "claude-haiku-4-5-20251001",
        )
    return GeminiClient(
        api_key=settings.gemini_api_key,
        model=settings.gemini_model or "gemini-3.5-flash",
    )


def active_provider_name() -> str:
    if settings.claude_api_key:
        return "claude"
    if settings.gemini_api_key:
        return "gemini"
    return "none"


def is_vision_available() -> bool:
    return bool(settings.claude_api_key or settings.gemini_api_key)

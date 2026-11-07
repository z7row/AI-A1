from typing import Any
from fastapi import WebSocket

PROCESSES: dict[str, dict[str, Any]] = {}
SUBSCRIBERS: dict[str, list[WebSocket]] = {}

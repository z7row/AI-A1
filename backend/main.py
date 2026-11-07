"""AO-AI backend — FastAPI process runner with PTY + live WebSocket logs."""
from __future__ import annotations

import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import APP_DIR
from core.storage import _enforce_quota
from routers import processes, files, history, settings, ws

app = FastAPI(title="AO-AI", version="1.3.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:2000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["*"],
)

# Ensure quota is checked on startup
_enforce_quota()

# Root
@app.get("/")
async def root() -> dict:
    return {"ok": True, "service": "AO-AI", "version": "1.3.0", "time": time.time()}

# Register Routers
app.include_router(processes.router)
app.include_router(files.router)
app.include_router(history.router)
app.include_router(settings.router)
app.include_router(ws.router)

import asyncio
import os
import uuid
from pathlib import Path
from typing import Any

from fastapi import APIRouter, HTTPException
from core.config import DANGEROUS_PATTERNS, strip_heredoc_bodies
from core.models import RunRequest, RunResponse
from core.state import PROCESSES
from core.storage import _log_path
from core.runner import _public, _count_tasks, _broadcast, run_process

router = APIRouter()

@router.post("/run", response_model=RunResponse)
async def run(req: RunRequest) -> RunResponse:
    if not req.cwd: raise HTTPException(400, "Working directory is required.")
    if not Path(req.cwd).is_dir(): raise HTTPException(400, f"Working directory does not exist: {req.cwd}")
    
    commands_only = strip_heredoc_bodies(req.terminal)
    for pattern in DANGEROUS_PATTERNS:
        if pattern.search(commands_only): 
            raise HTTPException(400, f"Rejected: script matches a dangerous pattern ({pattern.pattern}).")
    
    pid = uuid.uuid4().hex[:12]
    PROCESSES[pid] = {
        "id": pid, "title": req.title, "terminal": req.terminal, "cwd": req.cwd, "status": "pending",
        "progress": 0, "started_at": None, "finished_at": None, "exit_code": None, "log_path": str(_log_path(pid)),
        "tasks_total": _count_tasks(req.terminal), "tasks_done": 0, "changes_count": 0,
    }
    _log_path(pid).write_text("", encoding="utf-8")
    asyncio.create_task(run_process(pid))
    return RunResponse(id=pid, status="pending")

@router.get("/cwd")
async def current_cwd(): return {"cwd": os.getcwd()}

@router.get("/processes")
async def list_processes(): return [_public(p) for p in PROCESSES.values()]

@router.get("/processes/{pid}")
async def get_process(pid: str):
    p = PROCESSES.get(pid)
    if not p: raise HTTPException(404, "Process not found")
    return _public(p)

@router.get("/progress/{pid}")
async def get_progress(pid: str):
    p = PROCESSES.get(pid)
    if not p: raise HTTPException(404, "Process not found")
    return {"id": pid, "status": p["status"], "progress": p["progress"], "tasks_total": p["tasks_total"], "tasks_done": p["tasks_done"]}

@router.get("/log/{pid}")
async def get_log(pid: str):
    if pid not in PROCESSES: raise HTTPException(404, "Process not found")
    path = _log_path(pid)
    return {"id": pid, "log": path.read_text(encoding="utf-8") if path.exists() else ""}

@router.post("/kill/{pid}")
async def kill(pid: str):
    p = PROCESSES.get(pid)
    if not p: raise HTTPException(404, "Process not found")
    p["status"] = "killed"
    proc = p.get("_proc")
    if proc and proc.poll() is None:
        proc.terminate()
        try: proc.wait(timeout=3)
        except Exception: proc.kill()
    p["progress"], p["finished_at"] = 100, 0
    await _broadcast(pid, {"type": "status", "status": "killed"})
    return {"ok": True, "id": pid, "status": "killed"}

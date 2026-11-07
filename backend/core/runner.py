import asyncio
import fcntl
import os
import pty
import select
import struct
import subprocess
import termios
import time
from pathlib import Path
from typing import Any

def _process_history(pid: str, cwd: Path, before: dict, p: dict):
    """Run heavy disk I/O (snapshot, diff, save history) in a background thread."""
    after = _snapshot(cwd)
    changes, diff = _compute_changes(before, after)
    _save_history(
        pid,
        {
            "id": pid,
            "title": p.get("title"),
            "terminal": p.get("terminal"),
            "cwd": p.get("cwd"),
            "status": p.get("status"),
            "exit_code": p.get("exit_code"),
            "started_at": p.get("started_at"),
            "finished_at": p.get("finished_at"),
        },
        changes,
        diff,
    )
    p["changes_count"] = len(changes)
    _enforce_quota()

from core.config import IDLE_TIMEOUT_SECONDS
from core.state import PROCESSES, SUBSCRIBERS
from core.storage import _snapshot, _compute_changes, _save_history, _script_path, _append_log, _enforce_quota

Z7row_BANNER = (
    r'''echo -e "\n\033[1;97;41m Z7row \033[0m ''' 
    r'''\033[1;38;5;196mMade With Z7row\033[0m ''' 
    r'''\033[4;1;38;5;33mhttps://Z7row-sand.vercel.app\033[0m\n"'''
)

def _public(p: dict[str, Any]) -> dict[str, Any]:
    return {k: v for k, v in p.items() if not k.startswith("_")}

def _count_tasks(terminal: str) -> int:
    tasks, buf, in_heredoc = 0, [], False
    for line in terminal.splitlines():
        if in_heredoc:
            buf.append(line)
            if line.strip() == "EOF":
                in_heredoc, tasks = False, tasks + 1
                buf.clear()
            continue
        if "<<" in line and "EOF" in line:
            in_heredoc = True
            buf.append(line)
            continue
        if not line.strip():
            if buf: tasks, buf = tasks + 1, []
            continue
        buf.append(line)
    if buf: tasks += 1
    return max(1, tasks)

def _exit_status(returncode: int | None) -> str:
    if returncode == 0: return "done"
    # Only genuine user interrupts (SIGINT, SIGTERM) are considered "stopped"
    if returncode in (130, 143, -15): return "stopped"
    return "failed"

async def _broadcast(pid: str, message: dict) -> None:
    for ws in list(SUBSCRIBERS.get(pid, [])):
        try:
            await ws.send_json(message)
        except Exception:
            try: SUBSCRIBERS[pid].remove(ws)
            except ValueError: pass

async def _progress_ticker(pid: str) -> None:
    while PROCESSES.get(pid, {}).get("status") == "running":
        p = PROCESSES[pid]
        elapsed = time.time() - (p.get("started_at") or time.time())
        p["progress"] = min(90, 10 + int(elapsed * 2))
        await _broadcast(pid, {"type": "progress", "progress": p["progress"]})
        await asyncio.sleep(1)

async def run_process(pid: str) -> None:
    p = PROCESSES[pid]
    p["status"] = "running"
    p["started_at"] = time.time()
    p["last_activity"] = time.time()
    await _broadcast(pid, {"type": "status", "status": "running"})
    asyncio.create_task(_progress_ticker(pid))

    cwd = Path(p.get("cwd") or ".")
    
    # 1. Start snapshot in a background thread so it doesn't block the process start
    snapshot_task = asyncio.create_task(asyncio.to_thread(_snapshot, cwd))

    script = _script_path(pid)
    prelude = (
        "trap 'printf \"\\n[interrupted — continuing with next command]\\n\"' INT\n"
        "sleep 0.1\n"
    )
    script.write_text(prelude + p["terminal"] + "\n\n" + Z7row_BANNER + "\n", encoding="utf-8")
    script.chmod(0o700)

    env = os.environ.copy()
    env["TERM"] = "xterm-256color"
    env["PYTHONUNBUFFERED"] = "1"
    env.pop("CI", None)

    master_fd, slave_fd = pty.openpty()
    winsize = struct.pack("HHHH", 30, 120, 0, 0)
    fcntl.ioctl(slave_fd, termios.TIOCSWINSZ, winsize)

    proc: subprocess.Popen | None = None
    try:
        # Use start_new_session=True instead of the slow preexec_fn=os.setsid
        proc = subprocess.Popen(["bash", str(script)], stdin=slave_fd, stdout=slave_fd, stderr=slave_fd, cwd=p.get("cwd") or None, env=env, start_new_session=True, close_fds=True)
        os.close(slave_fd)
        slave_fd = -1
        p["_proc"] = proc
        p["_master_fd"] = master_fd

        loop = asyncio.get_running_loop()

        def _read() -> bytes:
            try:
                r, _, _ = select.select([master_fd], [], [], 0.5)
                if not r: return b""
                return os.read(master_fd, 4096)
            except OSError: return b""

        while True:
            if p["status"] == "killed": break
            data = await loop.run_in_executor(None, _read)
            if data:
                p["last_activity"] = time.time()
                text = data.decode("utf-8", errors="replace")
                _append_log(pid, text)
                await _broadcast(pid, {"type": "output", "line": text})
            else:
                if proc.poll() is not None: break
                if time.time() - p["last_activity"] > IDLE_TIMEOUT_SECONDS:
                    proc.kill()
                    msg = f"\n[timeout] no activity for {IDLE_TIMEOUT_SECONDS}s\n"
                    _append_log(pid, msg)
                    await _broadcast(pid, {"type": "output", "line": msg})
                    break

        proc.wait()
        p["exit_code"] = proc.returncode
        if p["status"] != "killed":
            p["status"] = _exit_status(proc.returncode)

    except Exception as exc:
        _append_log(pid, f"\n[backend error] {exc}\n")
        await _broadcast(pid, {"type": "output", "line": f"\n[backend error] {exc}\n"})
        p["status"], p["exit_code"] = "failed", -1
    finally:
        try: os.close(master_fd)
        except OSError: pass
        if slave_fd != -1:
            try: os.close(slave_fd)
            except OSError: pass
        p["finished_at"] = time.time()
        p["progress"], p["tasks_done"] = 100, p["tasks_total"]

        # 1. Tell the UI IMMEDIATELY that the process is done so the terminal
        # stops loading and buttons update instantly.
        await _broadcast(pid, {"type": "status", "status": p["status"], "exit_code": p.get("exit_code")})
        await _broadcast(pid, {"type": "progress", "progress": 100})

        # 2. Do the heavy snapshot / history logic in the background
        try: script.unlink(missing_ok=True)
        except OSError: pass
        
        # Wait for the "before" snapshot to finish if it hasn't already
        try:
            before = await snapshot_task
        except Exception:
            before = {}
            
        loop = asyncio.get_running_loop()
        await loop.run_in_executor(None, _process_history, pid, cwd, before, p)

import fcntl
import json
import os
import struct
import termios
import time
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from core.state import PROCESSES, SUBSCRIBERS
from core.storage import _log_path

router = APIRouter()

@router.websocket("/ws/{pid}")
async def ws(websocket: WebSocket, pid: str):
    await websocket.accept()
    SUBSCRIBERS.setdefault(pid, []).append(websocket)
    path = _log_path(pid)
    if path.exists():
        await websocket.send_json({"type": "snapshot", "log": path.read_text(encoding="utf-8")})
    try:
        while True:
            msg = await websocket.receive_text()
            try: data = json.loads(msg)
            except json.JSONDecodeError: continue
            kind = data.get("type")
            p = PROCESSES.get(pid)
            if kind == "input" and p:
                fd = p.get("_master_fd")
                if fd is not None:
                    try:
                        os.write(fd, data.get("data", "").encode("utf-8"))
                        p["last_activity"] = time.time()
                    except OSError: pass
            elif kind == "resize" and p:
                fd = p.get("_master_fd")
                if fd is not None:
                    try: fcntl.ioctl(fd, termios.TIOCSWINSZ, struct.pack("HHHH", int(data.get("rows") or 30), int(data.get("cols") or 120), 0, 0))
                    except OSError: pass
    except WebSocketDisconnect: pass
    finally:
        try: SUBSCRIBERS.get(pid, []).remove(websocket)
        except ValueError: pass

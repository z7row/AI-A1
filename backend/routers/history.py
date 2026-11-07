import json
import shutil
from fastapi import APIRouter, HTTPException
from core.config import HIST_DIR

router = APIRouter()

@router.get("/history")
async def list_history():
    items = []
    if not HIST_DIR.exists(): return items
    for d in HIST_DIR.iterdir():
        if not d.is_dir(): continue
        meta_file = d / "meta.json"
        if not meta_file.exists(): continue
        try:
            meta = json.loads(meta_file.read_text(encoding="utf-8"))
            changes_file = d / "changes.json"
            changes = json.loads(changes_file.read_text(encoding="utf-8")) if changes_file.exists() else []
            meta["changes_count"] = len(changes)
            meta["changes"] = changes
            items.append(meta)
        except Exception: continue
    items.sort(key=lambda x: x.get("started_at") or 0, reverse=True)
    return items

@router.get("/history/{pid}")
async def history_detail(pid: str):
    d = HIST_DIR / pid
    if not d.exists(): raise HTTPException(404, "History not found")
    meta = json.loads((d / "meta.json").read_text(encoding="utf-8"))
    changes = json.loads((d / "changes.json").read_text(encoding="utf-8")) if (d / "changes.json").exists() else []
    return {"meta": meta, "changes": changes}

@router.get("/history/{pid}/diff")
async def history_diff(pid: str):
    d = HIST_DIR / pid
    if not d.exists(): raise HTTPException(404, "History not found")
    p = d / "diff.patch"
    return {"diff": p.read_text(encoding="utf-8") if p.exists() else ""}

@router.get("/history/{pid}/log")
async def history_log(pid: str):
    d = HIST_DIR / pid
    if not d.exists(): raise HTTPException(404, "History not found")
    p = d / "log.txt"
    return {"log": p.read_text(encoding="utf-8") if p.exists() else ""}

@router.delete("/history/{pid}")
async def history_delete(pid: str):
    d = HIST_DIR / pid
    if not d.exists(): raise HTTPException(404, "History not found")
    shutil.rmtree(d, ignore_errors=True)
    return {"ok": True, "id": pid}

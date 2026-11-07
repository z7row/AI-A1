import json
from fastapi import APIRouter
from core.config import SETTINGS_DIR
from core.models import WhitelistBody, ExcludesBody

router = APIRouter()
WHITELIST_FILE = SETTINGS_DIR / "whitelist.json"
EXCLUDES_FILE = SETTINGS_DIR / "excludes.json"

@router.get("/settings/whitelist")
async def get_whitelist():
    if not WHITELIST_FILE.exists(): return {"entries": [], "enabled": True}
    try:
        data = json.loads(WHITELIST_FILE.read_text(encoding="utf-8"))
        if isinstance(data, dict):
            return {"entries": [str(x) for x in data.get("entries", []) if isinstance(x, (str, int))], "enabled": bool(data.get("enabled", True))}
    except Exception: pass
    return {"entries": [], "enabled": True}

@router.post("/settings/whitelist")
async def save_whitelist(body: WhitelistBody):
    entries = [str(x).strip() for x in body.entries if str(x).strip()]
    payload = {"entries": entries, "enabled": bool(body.enabled)}
    WHITELIST_FILE.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
    return {"ok": True, "count": len(entries), "enabled": bool(body.enabled)}

@router.get("/settings/excludes")
async def get_excludes():
    if not EXCLUDES_FILE.exists(): return {"patterns": []}
    try:
        data = json.loads(EXCLUDES_FILE.read_text(encoding="utf-8"))
        if isinstance(data, dict) and isinstance(data.get("patterns"), list): return {"patterns": [str(x) for x in data["patterns"]]}
    except Exception: pass
    return {"patterns": []}

@router.post("/settings/excludes")
async def save_excludes(body: ExcludesBody):
    patterns = [str(x).strip() for x in body.patterns if str(x).strip()]
    EXCLUDES_FILE.write_text(json.dumps({"patterns": patterns}, indent=2, ensure_ascii=False), encoding="utf-8")
    return {"ok": True, "count": len(patterns)}

from pathlib import Path
from typing import Any
from fastapi import APIRouter, HTTPException
from core.config import SKIP_DIRS

router = APIRouter()

@router.get("/files")
async def list_files(path: str | None = None):
    base = Path(path).expanduser().resolve() if path else Path.cwd()
    if not base.is_dir(): raise HTTPException(400, f"Not a directory: {base}")
    try:
        entries = []
        for e in sorted(base.iterdir(), key=lambda x: (not x.is_dir(), x.name.lower())):
            if e.name.startswith(".") or e.name in SKIP_DIRS: continue
            try:
                st = e.stat()
                entries.append({"name": e.name, "path": str(e), "dir": e.is_dir(), "size": st.st_size if e.is_file() else 0})
            except OSError: continue
    except PermissionError: raise HTTPException(403, f"Permission denied: {base}")
    return {"path": str(base), "parent": str(base.parent) if base != base.parent else None, "entries": entries}

@router.get("/file")
async def read_file(path: str):
    f = Path(path).expanduser().resolve()
    if not f.is_file(): raise HTTPException(400, f"Not a file: {f}")
    try:
        st = f.stat()
        if st.st_size > 1_000_000: raise HTTPException(400, "File too large (>1MB)")
        return {"path": str(f), "content": f.read_text(encoding="utf-8", errors="replace"), "size": st.st_size}
    except HTTPException: raise
    except Exception as e: raise HTTPException(500, str(e))

def _build_tree_text(base: Path, skip: set[str], max_files: int):
    lines = ["./"]
    state = {"count": 0, "truncated": False}
    def recurse(path: Path, prefix: str):
        if state["truncated"]: return
        try: entries = [e for e in path.iterdir() if not e.name.startswith(".")]
        except (OSError, PermissionError): return
        ordered = sorted([e for e in entries if e.is_dir()], key=lambda e: e.name.lower()) + sorted([e for e in entries if not e.is_dir()], key=lambda e: e.name.lower())
        for i, e in enumerate(ordered):
            if state["truncated"]: return
            is_last = i == len(ordered) - 1
            connector, extension = ("└── ", "    ") if is_last else ("├── ", "│   ")
            if e.name in skip:
                lines.append(f"{prefix}{connector}{e.name}{'/' if e.is_dir() else ''} (excluded)")
                continue
            if e.is_dir():
                lines.append(f"{prefix}{connector}{e.name}/")
                recurse(e, prefix + extension)
            else:
                lines.append(f"{prefix}{connector}{e.name}")
                state["count"] += 1
                if state["count"] >= max_files:
                    state["truncated"] = True
                    return
    recurse(base, "")
    if state["truncated"]: lines.append("... (list truncated)")
    return "\n".join(lines), state["count"], state["truncated"]

@router.get("/files/tree")
async def file_tree(path: str | None = None, exclude: str | None = None, max_files: int = 2000):
    base = Path(path).expanduser().resolve() if path else Path.cwd()
    if not base.is_dir(): raise HTTPException(400, f"Not a directory: {base}")
    extra = set(raw.strip() for raw in exclude.split(",") if raw.strip()) if exclude else set()
    try: tree_text, count, truncated = _build_tree_text(base, SKIP_DIRS | extra, max_files)
    except PermissionError: raise HTTPException(403, f"Permission denied: {base}")
    return {"path": str(base), "tree": tree_text, "count": count, "truncated": truncated}

@router.get("/browse")
async def browse(path: str | None = None):
    home = Path.home()
    target = Path(path).expanduser().resolve() if path else home
    if not target.is_dir(): raise HTTPException(400, f"Not a directory: {target}")
    try: entries = sorted([e for e in target.iterdir() if e.is_dir() and not e.name.startswith(".")], key=lambda e: e.name.lower())
    except PermissionError: raise HTTPException(403, f"Permission denied: {target}")
    return {"path": str(target), "parent": str(target.parent) if target != target.parent else None, "home": str(home), "dirs": [{"name": e.name, "path": str(e)} for e in entries]}

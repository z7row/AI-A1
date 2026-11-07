import difflib
import hashlib
import json
import os
import shutil
import sys
from pathlib import Path
from typing import Any

from core.config import HIST_DIR, LOG_DIR, MAX_SNAPSHOT_FILE_BYTES, SKIP_DIRS
from core.state import PROCESSES

def _enforce_quota() -> None:
    try:
        cap_mb = int(os.environ.get("AO_MAX_LOG_MB", "200"))
    except (TypeError, ValueError):
        cap_mb = 200
    cap_bytes = max(0, cap_mb) * 1024 * 1024

    log_entries = []
    for p in LOG_DIR.glob("*.log"):
        try:
            st = p.stat()
            log_entries.append((st.st_mtime, st.st_size, p))
        except OSError:
            continue

    hist_entries = []
    for d in HIST_DIR.iterdir():
        if not d.is_dir():
            continue
        size = sum(f.stat().st_size for f in d.rglob("*") if f.is_file()) if d.exists() else 0
        try:
            hist_entries.append((d.stat().st_mtime, size, d))
        except OSError:
            continue

    total = sum(s for _, s, _ in log_entries) + sum(s for _, s, _ in hist_entries)
    if total <= cap_bytes:
        return

    merged = [("log", *e) for e in log_entries] + [("hist", *e) for e in hist_entries]
    merged.sort(key=lambda x: x[1])

    for kind, _, size, path in merged:
        if total <= cap_bytes:
            break
        if kind == "log":
            pid = path.stem
            proc = PROCESSES.get(pid)
            if proc and proc.get("status") in ("running", "pending"):
                continue
            try:
                path.unlink()
                total -= size
            except OSError:
                continue
        else:
            try:
                shutil.rmtree(path)
                total -= size
            except OSError:
                continue

def _sha1(path: Path) -> str | None:
    try:
        h = hashlib.sha1()
        with path.open("rb") as fh:
            for chunk in iter(lambda: fh.read(65536), b""):
                h.update(chunk)
        return h.hexdigest()
    except OSError:
        return None

def _snapshot(root: Path) -> dict[str, dict[str, Any]]:
    out = {}
    if not root.is_dir():
        return out
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS and not d.startswith(".")]
        for name in filenames:
            if name.startswith("."):
                continue
            full = Path(dirpath) / name
            try:
                st = full.stat()
            except OSError:
                continue
            rel = str(full.relative_to(root))
            entry = {"size": st.st_size, "mtime": st.st_mtime, "sha1": _sha1(full), "text": None}
            if st.st_size <= MAX_SNAPSHOT_FILE_BYTES:
                try:
                    entry["text"] = full.read_text(encoding="utf-8")
                except (UnicodeDecodeError, OSError):
                    pass
            out[rel] = entry
    return out

def _compute_changes(before: dict, after: dict) -> tuple[list[dict], str]:
    changes, diff_chunks = [], []
    all_paths = set(before.keys()) | set(after.keys())
    for rel in sorted(all_paths):
        b, a = before.get(rel), after.get(rel)
        status = "created" if b is None else "deleted" if a is None else "modified" if b.get("sha1") != a.get("sha1") else None
        if not status:
            continue
        changes.append({"path": rel, "status": status})
        old_text = (b or {}).get("text") or ""
        new_text = (a or {}).get("text") or ""
        if status == "deleted": new_text = ""
        elif status == "created": old_text = ""
        if not old_text and not new_text: continue
        diff = difflib.unified_diff(old_text.splitlines(keepends=True), new_text.splitlines(keepends=True), fromfile=f"a/{rel}", tofile=f"b/{rel}", n=3)
        chunk = "".join(diff)
        if chunk: diff_chunks.append(chunk)
    return changes, "".join(diff_chunks)

def _hist_dir(pid: str) -> Path:
    return HIST_DIR / pid

def _save_history(pid: str, meta: dict, changes: list, diff: str) -> None:
    try:
        hd = _hist_dir(pid)
        hd.mkdir(exist_ok=True)
        (hd / "meta.json").write_text(json.dumps(meta, indent=2, ensure_ascii=False), encoding="utf-8")
        (hd / "changes.json").write_text(json.dumps(changes, indent=2, ensure_ascii=False), encoding="utf-8")
        (hd / "diff.patch").write_text(diff, encoding="utf-8")
        lp = _log_path(pid)
        if lp.exists(): shutil.copy2(lp, hd / "log.txt")
    except Exception as exc:
        print(f"[history] save failed for {pid}: {exc}", file=sys.stderr)

def _log_path(pid: str) -> Path:
    return LOG_DIR / f"{pid}.log"

def _script_path(pid: str) -> Path:
    return LOG_DIR / f"{pid}.sh"

def _append_log(pid: str, text: str) -> None:
    with _log_path(pid).open("a", encoding="utf-8") as fh:
        fh.write(text)

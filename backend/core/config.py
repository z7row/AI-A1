import re
from pathlib import Path

APP_DIR = Path(__file__).parent.parent
LOG_DIR = APP_DIR / "logs"
HIST_DIR = APP_DIR / "history"
PROMPTS_DIR = APP_DIR / "prompts"
SETTINGS_DIR = APP_DIR / "settings"

for d in (LOG_DIR, HIST_DIR, PROMPTS_DIR, SETTINGS_DIR):
    d.mkdir(exist_ok=True)

ALLOWED_PROMPT_IDS = {"first", "custom"}
IDLE_TIMEOUT_SECONDS = 600
MAX_SNAPSHOT_FILE_BYTES = 512 * 1024

SKIP_DIRS = {
    "node_modules", ".git", ".next", "dist", "build", "target",
    "__pycache__", ".venv", "venv", "env", ".cache", ".idea",
    ".vscode", "coverage", ".pytest_cache", ".mypy_cache",
    ".turbo", ".parcel-cache", "out", ".gradle", ".dart_tool",
}

DANGEROUS_PATTERNS = [
    re.compile(r"rm\s+-rf\s+(/|/\*|~)(\s|$)", re.I),
    re.compile(r"\bmkfs(\.\w+)?\b", re.I),
    re.compile(r"\bdd\s+if=", re.I),
    re.compile(r"chmod\s+-R\s+777\s+/(\s|$)", re.I),
    re.compile(r"chown\s+-R\s+\S+\s+/(\s|$)", re.I),
    re.compile(r"\b(shutdown|reboot|poweroff)\b", re.I),
    re.compile(r"\binit\s+0\b", re.I),
    re.compile(r"(curl|wget)\b[^\n|]*\|\s*(bash|sh|zsh)\b", re.I),
]

def strip_heredoc_bodies(script: str) -> str:
    lines = script.split("\n")
    out = []
    terminator = None

    for line in lines:
        if terminator:
            if line.strip() == terminator:
                terminator = None
                out.append(line)
            continue

        m = re.search(r"<<-?\s*['\"]?([A-Za-z_][A-Za-z0-9_]*)['\"]?", line)
        if m:
            terminator = m.group(1)

        out.append(line)

    return "\n".join(out)

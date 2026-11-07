#!/usr/bin/env fish

set SCRIPT_DIR (dirname (status --current-filename))
set BACKEND_DIR "$SCRIPT_DIR/backend"

cd "$BACKEND_DIR"
source "$BACKEND_DIR/.venv/bin/activate.fish"
# قم بإزالة --app-dir واجعله يعتمد على مجلد العمل الحالي الذي قمت بالدخول إليه عبر cd
python -m uvicorn main:app --host 127.0.0.1 --port 2030 --reload
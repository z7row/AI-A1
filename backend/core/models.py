from pydantic import BaseModel

class RunRequest(BaseModel):
    title: str = "Untitled task"
    terminal: str
    cwd: str | None = None

class RunResponse(BaseModel):
    id: str
    status: str

class WhitelistBody(BaseModel):
    entries: list[str] = []
    enabled: bool = True

class ExcludesBody(BaseModel):
    patterns: list[str] = []

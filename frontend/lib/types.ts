export type TaskJson = {
  title?: string;
  messages: string;
  terminal: string;
};

export type ParsedFile = {
  path: string;
  lang: string;
  content: string;
};

export type ParsedEdit = {
  path: string;
  find: string;
  replace: string;
};

export type ParsedPatch = {
  path: string;
  diff: string;
};

export type ParsedResponse = {
  title?: string;
  plan?: string;
  commands: string;
  files: ParsedFile[];
  patches: ParsedPatch[];
  edits: ParsedEdit[];
  deletions: string[];
  outputNotes: string[];
  warnings: string[];
  raw: string;
};

export type ProcessStatus =
  | "pending"
  | "running"
  | "done"
  | "failed"
  | "stopped"
  | "killed";

export type ProcessInfo = {
  id: string;
  title: string;
  terminal: string;
  cwd?: string | null;
  status: ProcessStatus;
  progress: number;
  started_at: number | null;
  finished_at: number | null;
  exit_code: number | null;
  log_path: string;
  tasks_total: number;
  tasks_done: number;
  changes_count?: number;
};

export type FileEntry = {
  name: string;
  path: string;
  dir: boolean;
  size: number;
};

export type FilesListing = {
  path: string;
  parent: string | null;
  entries: FileEntry[];
};

export type HistoryChange = {
  path: string;
  status: "created" | "modified" | "deleted";
};

export type HistoryMeta = {
  id: string;
  title?: string;
  terminal: string;
  cwd?: string;
  status: ProcessStatus;
  exit_code: number | null;
  started_at: number | null;
  finished_at: number | null;
  changes_count: number;
  changes: HistoryChange[];
};

export type HistoryDetail = {
  meta: Omit<HistoryMeta, "changes" | "changes_count">;
  changes: HistoryChange[];
};

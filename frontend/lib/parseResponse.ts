import type {
  ParsedFile,
  ParsedPatch,
  ParsedResponse,
  ParsedEdit,
} from "./types";
import { stripInvisible } from "./sanitize";

type Result = { ok: true; data: ParsedResponse } | { ok: false; error: string };

function stripOuterFence(s: string): string {
  const trimmed = s.trim();
  const m = trimmed.match(/^(`{3,})(?:markdown|md)?\s*\n([\s\S]*?)\n\1\s*$/i);
  return m ? m[2] : trimmed;
}

function extractCodeBlock(s: string): { lang: string; content: string } | null {
  const lines = s.split("\n");
  let openIdx = -1;
  let fence = "";
  let lang = "";

  // Find opening fence
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(`{3,})([a-zA-Z0-9_+\-.]*)\s*$/);
    if (m) {
      openIdx = i;
      fence = m[1];
      lang = m[2].toLowerCase();
      break;
    }
  }
  if (openIdx === -1) return null;

  // Find closing fence (scan backward to find the outermost)
  let closeIdx = -1;
  for (let i = lines.length - 1; i > openIdx; i--) {
    const trimmed = lines[i].trim();
    if (trimmed.length >= fence.length && /^`+$/.test(trimmed)) {
      closeIdx = i;
      break;
    }
  }
  if (closeIdx === -1) return null;

  const content = lines.slice(openIdx + 1, closeIdx).join("\n");
  return { lang, content };
}

function extractLeadingTitle(s: string): { title?: string; rest: string } {
  const t = s.replace(/^\s+/, "");
  const m = t.match(/^#\s+([^\n]+)/);
  if (!m) return { rest: s };
  return {
    title: m[1].trim(),
    rest: t.slice(m[0].length).replace(/^\s*\n/, ""),
  };
}

const KNOWN_SECTIONS = new Set([
  "title",
  "notes",
  "plan",
  "commands",
  "files",
]);

function splitSections(raw: string): { sections: Record<string, string>; preamble: string } {
  const fences: { start: number; end: number }[] = [];
  const fenceRe = /^(`{3,})([a-zA-Z0-9_+\-.]*)\s*$/gm;
  let fm;
  let currentFenceStart = -1;
  let currentFenceLen = 0;
  while ((fm = fenceRe.exec(raw)) !== null) {
    if (currentFenceStart === -1) {
      currentFenceStart = fm.index;
      currentFenceLen = fm[1].length;
    } else if (fm[1].length >= currentFenceLen) {
      fences.push({ start: currentFenceStart, end: fm.index + fm[0].length });
      currentFenceStart = -1;
      currentFenceLen = 0;
    }
  }
  if (currentFenceStart !== -1) {
    fences.push({ start: currentFenceStart, end: raw.length });
  }

  function isInsideFence(index: number): boolean {
    return fences.some((f) => index >= f.start && index < f.end);
  }

  const headerRe = /^##\s+(.+?)\s*$/gm;
  const headers: {
    name: string;
    headerStart: number;
    contentStart: number;
  }[] = [];
  let m: RegExpExecArray | null;
  while ((m = headerRe.exec(raw)) !== null) {
    if (isInsideFence(m.index)) continue;
    const name = m[1].trim().toLowerCase();
    if (!KNOWN_SECTIONS.has(name)) continue;
    headers.push({
      name,
      headerStart: m.index,
      contentStart: m.index + m[0].length,
    });
  }

  const sections: Record<string, string> = {};
  for (let i = 0; i < headers.length; i++) {
    const start = headers[i].contentStart;
    const stop =
      i + 1 < headers.length ? headers[i + 1].headerStart : raw.length;
    sections[headers[i].name] = raw.slice(start, stop).trim();
  }

  let preambleEnd = raw.length;
  if (headers.length > 0) {
    preambleEnd = Math.min(preambleEnd, headers[0].headerStart);
  }

  const blockHeaderRe = /^###\s+(FILE|PATCH|EDIT|DELETE):/gm;
  let bm: RegExpExecArray | null;
  while ((bm = blockHeaderRe.exec(raw)) !== null) {
    if (isInsideFence(bm.index)) continue;
    preambleEnd = Math.min(preambleEnd, bm.index);
    break;
  }

  const preamble = raw.slice(0, preambleEnd).trim();

  return { sections, preamble };
}

function ensureDiffHeaders(diff: string, path: string): string {
  const hasHeaders = /^---\s/m.test(diff) && /^\+\+\+\s/m.test(diff);
  if (hasHeaders) return diff;
  return `--- ${path}\n+++ ${path}\n${diff}`;
}

function extractOutputNotes(raw: string): { notes: string[]; cleaned: string } {
  const fences: { start: number; end: number }[] = [];
  const fenceRe = /^(`{3,})([a-zA-Z0-9_+\-.]*)\s*$/gm;
  let fm;
  let currentFenceStart = -1;
  let currentFenceLen = 0;
  while ((fm = fenceRe.exec(raw)) !== null) {
    if (currentFenceStart === -1) {
      currentFenceStart = fm.index;
      currentFenceLen = fm[1].length;
    } else if (fm[1].length >= currentFenceLen) {
      fences.push({ start: currentFenceStart, end: fm.index + fm[0].length });
      currentFenceStart = -1;
      currentFenceLen = 0;
    }
  }
  if (currentFenceStart !== -1) {
    fences.push({ start: currentFenceStart, end: raw.length });
  }

  function isInsideFence(index: number): boolean {
    return fences.some((f) => index >= f.start && index < f.end);
  }

  const lines = raw.split("\n");
  const notes: string[] = [];
  const kept: string[] = [];
  let inFileBlock = false;
  let currentPos = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    const isFence = /^(`{3,})/.test(trimmed);

    if (!isFence && !isInsideFence(currentPos)) {
      if (/^###\s+(FILE|PATCH|EDIT|DELETE):/.test(line)) {
        inFileBlock = true;
      } else if (/^###\s+/.test(line) || /^##\s+/.test(line)) {
        inFileBlock = false;
      }
    }

    if (!isFence && !inFileBlock && !isInsideFence(currentPos)) {
      const m = line.match(/^@output(?:\s+(.+?))?\s*$/);
      if (m) {
        notes.push(m[1]?.trim() || "Check the output below.");
        currentPos += line.length + 1;
        continue;
      }
    }
    kept.push(line);
    currentPos += line.length + 1;
  }

  return { notes, cleaned: kept.join("\n") };
}

function parseEditBlock(s: string): { find: string; replace: string } | null {
  const m = s.match(
    /^<{5,}\s*FIND\s*\n([\s\S]*?)\n?={5,}\s*\n([\s\S]*?)\n?>{5,}\s*REPLACE\s*$/m,
  );
  if (!m) return null;
  return { find: m[1], replace: m[2] };
}

function isSafeRelativePath(p: string): boolean {
  if (!p || !p.trim()) return false;
  if (p.startsWith("/") || p.startsWith("~")) return false;
  if (/^[a-zA-Z]:[\\/]/.test(p)) return false;
  const norm = p.replace(/\\/g, "/");
  const segments = norm.split("/");
  if (segments.some((seg) => seg === "..")) return false;
  if (norm.includes("\0")) return false;
  return true;
}

function assertSafePathOrThrow(p: string): void {
  if (!isSafeRelativePath(p)) {
    throw new Error(`Unsafe path rejected in buildScript: "${p}"`);
  }
}

export function parseAiResponse(input: string): Result {
  const cleaned0 = stripInvisible(input);
  if (!cleaned0.trim()) {
    return { ok: false, error: "Nothing to parse." };
  }
  const { notes: outputNotes, cleaned } = extractOutputNotes(cleaned0);

  const raw = stripOuterFence(cleaned);

  let { title: h1Title, rest: withoutH1 } = extractLeadingTitle(raw);

  if (!h1Title) {
    const lines = withoutH1.split("\n");
    const firstNonEmptyIdx = lines.findIndex(l => l.trim().length > 0);
    if (firstNonEmptyIdx !== -1) {
      const firstLine = lines[firstNonEmptyIdx].trim();
      if (!firstLine.startsWith("##") && !firstLine.startsWith("###")) {
        h1Title = firstLine.replace(/^#+\s*/, "").trim();
      }
    }
  }

  const { sections, preamble } = splitSections(withoutH1);

  const sectionTitle = sections["title"]?.trim();
  const finalTitle = sectionTitle || h1Title || undefined;

  let notesText = sections["notes"]?.trim() || sections["plan"]?.trim() || "";
  if (!notesText && preamble) {
    notesText = preamble;
  }

  if (Object.keys(sections).length === 0 && !finalTitle && !notesText) {
    return {
      ok: false,
      error:
        'No content found. Expected either a leading "# AI_A1 | title" line, or at least one "## notes" / "## commands" / "## files" section.',
    };
  }

  const commandsBody = sections["commands"] ?? "";
  const commandsCb = extractCodeBlock(commandsBody);
  const commands = stripInvisible(
    commandsCb ? commandsCb.content : commandsBody,
  ).trim();

  const files: ParsedFile[] = [];
  const patches: ParsedPatch[] = [];
  const edits: ParsedEdit[] = [];
  const deletions: string[] = [];
  const warnings: string[] = [];

  let filesBody = sections["files"] ?? "";

  if (!filesBody) {
    const fences: { start: number; end: number }[] = [];
    const fenceRe = /^(`{3,})([a-zA-Z0-9_+\-.]*)\s*$/gm;
    let fm;
    let currentFenceStart = -1;
    let currentFenceLen = 0;
    while ((fm = fenceRe.exec(withoutH1)) !== null) {
      if (currentFenceStart === -1) {
        currentFenceStart = fm.index;
        currentFenceLen = fm[1].length;
      } else if (fm[1].length >= currentFenceLen) {
        fences.push({ start: currentFenceStart, end: fm.index + fm[0].length });
        currentFenceStart = -1;
        currentFenceLen = 0;
      }
    }
    if (currentFenceStart !== -1) {
      fences.push({ start: currentFenceStart, end: withoutH1.length });
    }

    function isInsideFence(index: number): boolean {
      return fences.some((f) => index >= f.start && index < f.end);
    }

    const blockHeaderRe = /^###\s+(FILE|PATCH|EDIT|DELETE):/gm;
    let bm: RegExpExecArray | null;
    let startIdx = -1;
    while ((bm = blockHeaderRe.exec(withoutH1)) !== null) {
      if (isInsideFence(bm.index)) continue;
      startIdx = bm.index;
      break;
    }
    if (startIdx !== -1) {
      filesBody = withoutH1.slice(startIdx);
    }
  }

  // Find all fence blocks in filesBody
  const fences: { start: number; end: number }[] = [];
  const fenceRe = /^(`{3,})([a-zA-Z0-9_+\-.]*)\s*$/gm;
  let fm;
  let currentFenceStart = -1;
  let currentFenceLen = 0;
  while ((fm = fenceRe.exec(filesBody)) !== null) {
    if (currentFenceStart === -1) {
      currentFenceStart = fm.index;
      currentFenceLen = fm[1].length;
    } else if (fm[1].length >= currentFenceLen) {
      fences.push({ start: currentFenceStart, end: fm.index + fm[0].length });
      currentFenceStart = -1;
      currentFenceLen = 0;
    }
  }
  if (currentFenceStart !== -1) {
    fences.push({ start: currentFenceStart, end: filesBody.length });
  }

  function isInsideFence(index: number): boolean {
    return fences.some((f) => index >= f.start && index < f.end);
  }

  const blockHeaderRe = /^###\s+(FILE|PATCH|EDIT|DELETE):\s*(.+?)\s*$/gm;
  const blocks: {
    kind: "FILE" | "PATCH" | "EDIT" | "DELETE";
    path: string;
    start: number;
    end: number;
  }[] = [];
  let bm: RegExpExecArray | null;
  while ((bm = blockHeaderRe.exec(filesBody)) !== null) {
    if (isInsideFence(bm.index)) continue;
    blocks.push({
      kind: bm[1].toUpperCase() as "FILE" | "PATCH" | "EDIT" | "DELETE",
      path: bm[2].trim(),
      start: bm.index,
      end: bm.index + bm[0].length,
    });
  }

  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];

    if (!isSafeRelativePath(b.path)) {
      warnings.push(
        `Skipped ${b.kind} (${b.path}) — unsafe path (no "../", no absolute paths).`,
      );
      continue;
    }

    const bodyEnd =
      i + 1 < blocks.length ? blocks[i + 1].start : filesBody.length;
    const body = filesBody.slice(b.end, bodyEnd).trim();

    if (b.kind === "DELETE") {
      deletions.push(b.path);
      continue;
    }

    const cb = extractCodeBlock(body);
    if (!cb) {
      warnings.push(
        `Skipped ${b.kind} (${b.path}) — its block has no fenced code section.`,
      );
      continue;
    }

    if (b.kind === "FILE") {
      files.push({
        path: b.path,
        lang: cb.lang,
        content: stripInvisible(cb.content),
      });
    } else if (b.kind === "PATCH") {
      patches.push({
        path: b.path,
        diff: ensureDiffHeaders(stripInvisible(cb.content), b.path),
      });
    } else {
      const parsed = parseEditBlock(cb.content);
      if (!parsed) {
        warnings.push(
          `Skipped EDIT (${b.path}) — missing <<<<<<< FIND / ======= / >>>>>>> REPLACE markers.`,
        );
        continue;
      }
      edits.push({
        path: b.path,
        find: stripInvisible(parsed.find),
        replace: stripInvisible(parsed.replace),
      });
    }
  }

  const hasTitle = !!finalTitle;
  const hasPlan = !!notesText;
  if (
    files.length === 0 &&
    patches.length === 0 &&
    edits.length === 0 &&
    deletions.length === 0 &&
    !commands.trim() &&
    !hasTitle &&
    !hasPlan
  ) {
    return {
      ok: false,
      error: warnings.length
        ? `Nothing usable — every block failed.\n\n${warnings.join("\n")}`
        : "Response has no title, notes, commands, files, or patches.",
    };
  }

  return {
    ok: true,
    data: {
      title: finalTitle,
      plan: stripInvisible(notesText) || undefined,
      commands,
      files,
      outputNotes,
      patches,
      edits,
      deletions,
      warnings,
      raw,
    },
  };
}

function pickDelimiter(content: string): string {
  const lines = new Set(content.split("\n"));
  let n = 0;
  while (true) {
    const d = `AO_EOF_${n}`;
    if (!lines.has(d)) return d;
    n++;
  }
}

const FILE_LOG_PREFIX = "\\033[1;38;5;196m[Z7row]\\033[0m";

function transformCatCommands(commands: string): string {
  return commands
    .split("\n")
    .map((line) => {
      const match = line.match(/^(\s*)cat\s+([^\s|&;<>]+)(.*)$/);
      if (match) {
        const indent = match[1];
        const file = match[2];
        const rest = match[3];
        const safeFile = JSON.stringify(file);
        return `${indent}printf '\\n---\\n\n\\033[1;31m%s\\033[0m\\n\\n' ${safeFile}\n${indent}cat ${file}${rest}`;
      }
      return line;
    })
    .join("\n");
}

export function buildScript(data: ParsedResponse): string {
  const parts: string[] = [];

  parts.push(`AO_ROOT="$(pwd)"`);

  if (data.commands.trim()) {
    const cleanCommands = stripInvisible(data.commands).trim();
    if (cleanCommands) {
      const transformedCommands = transformCatCommands(cleanCommands);
      const tok = pickDelimiter(transformedCommands);
      parts.push(
        `cat > /tmp/ao_cmds.sh << '${tok}'\n` +
          `${transformedCommands}\n` +
          `${tok}\n` +
          `bash /tmp/ao_cmds.sh\n` +
          `rm -f /tmp/ao_cmds.sh`,
      );
    }
  }

  for (const file of data.files) {
    assertSafePathOrThrow(file.path);

    const delim = pickDelimiter(file.content);
    const dir = file.path.includes("/")
      ? file.path.slice(0, file.path.lastIndexOf("/"))
      : "";
    const mkdir = dir ? `mkdir -p "$AO_ROOT/${dir}"\n` : "";
    const log = `printf '${FILE_LOG_PREFIX} Writing %s\\n' ${JSON.stringify(file.path)}\n`;
    const content = stripInvisible(file.content);

    parts.push(
      `${mkdir}${log}` +
        `cat << '${delim}' > "$AO_ROOT/${file.path}"\n` +
        `${content}\n` +
        `${delim}`,
    );
  }

  data.edits.forEach((edit, i) => {
    assertSafePathOrThrow(edit.path);

    const findTok = `AO_FIND_${i}`;
    const replTok = `AO_REPL_${i}`;
    const findFile = `/tmp/ao_find_${i}`;
    const replFile = `/tmp/ao_repl_${i}`;
    const log = `printf '${FILE_LOG_PREFIX} Editing %s\\n' ${JSON.stringify(edit.path)}\n`;

    parts.push(
      `${log}` +
        `cat > ${findFile} << '${findTok}'\n${stripInvisible(edit.find)}\n${findTok}\n` +
        `cat > ${replFile} << '${replTok}'\n${stripInvisible(edit.replace)}\n${replTok}\n` +
        `AO_PATH="$AO_ROOT/${edit.path}" \\\n` +
        `  AO_FIND=${findFile} \\\n` +
        `  AO_REPL=${replFile} \\\n` +
        `  python3 -c '\n` +
        `import os, pathlib, sys\n` +
        `path = pathlib.Path(os.environ["AO_PATH"])\n` +
        `if not path.exists():\n` +
        `    print("[EDIT] FAILED: file not found:", path); sys.exit(4)\n` +
        `find = pathlib.Path(os.environ["AO_FIND"]).read_text()\n` +
        `repl = pathlib.Path(os.environ["AO_REPL"]).read_text()\n` +
        `if find.endswith("\\n"): find = find[:-1]\n` +
        `if repl.endswith("\\n"): repl = repl[:-1]\n` +
        `text = path.read_text()\n` +
        `if find not in text:\n` +
        `    print("[EDIT] FAILED: pattern not found in", path); sys.exit(2)\n` +
        `c = text.count(find)\n` +
        `if c > 1:\n` +
        `    print("[EDIT] FAILED: pattern is not unique (", c, "matches) in", path); sys.exit(3)\n` +
        `path.write_text(text.replace(find, repl, 1))\n` +
        `print("[EDIT] updated", path)\n` +
        `'\n` +
        `ao_status=$?\n` +
        `rm -f ${findFile} ${replFile}\n` +
        `if [ $ao_status -ne 0 ]; then\n` +
        `  printf '\\n\\033[1;33m=== EDIT FAILED — CURRENT CONTENT OF %s ===\\033[0m\\n' ${JSON.stringify(edit.path)}\n` +
        `  cat "$AO_ROOT/${edit.path}" 2>/dev/null || echo "(file not found)"\n` +
        `  printf '\\n\\033[1;33m=== END ===\\033[0m\\n'\n` +
        `  exit $ao_status\n` +
        `fi`,
    );
  });

  for (const p of data.deletions) {
    assertSafePathOrThrow(p);
    parts.push(
      `printf '${FILE_LOG_PREFIX} Removing %s\\n' ${JSON.stringify(p)}\n` +
        `rm -f "$AO_ROOT/${p}"`,
    );
  }

  data.patches.forEach((patch, i) => {
    assertSafePathOrThrow(patch.path);

    const token = `AO_PATCH_${i}`;
    const log = `printf '${FILE_LOG_PREFIX} Patching %s\\n' ${JSON.stringify(patch.path)}\n`;

    parts.push(
      `${log}` +
        `patch -d "$AO_ROOT" -p0 --no-backup-if-mismatch --batch <<'${token}'\n` +
        `${stripInvisible(patch.diff)}\n` +
        `${token}\n` +
        `ao_status=$?\n` +
        `if [ $ao_status -ne 0 ]; then\n` +
        `  printf '${FILE_LOG_PREFIX} FAILED %s (exit %s)\\n' ${JSON.stringify(patch.path)} $ao_status\n` +
        `  exit 1\n` +
        `fi`,
    );
  });

  const finalScript = stripInvisible(parts.join("\n\n"));
  return finalScript;
}

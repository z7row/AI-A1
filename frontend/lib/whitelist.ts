export const WHITELIST_PRESETS: { label: string; entries: string[] }[] = [
  {
    label: "Read / inspect",
    entries: [
      "ls",
      "pwd",
      "cat",
      "head",
      "tail",
      "grep",
      "wc",
      "find",
      "which",
      "whoami",
      "date",
      "echo",
      "printf",
    ],
  },
  {
    label: "Filesystem",
    entries: ["mkdir"],
  },
  {
    label: "Timing",
    entries: ["sleep"],
  },
  {
    label: "Git (read-only)",
    entries: [
      "git status",
      "git log",
      "git diff",
      "git branch",
      "git remote",
    ],
  },
  {
    label: "Version checks",
    entries: [
      "node --version",
      "npm --version",
      "python --version",
      "pip --version",
    ],
  },
];

export type WhitelistLineResult = { line: string; allowed: boolean };

export type WhitelistCheckResult = {
  allAllowed: boolean;
  lines: WhitelistLineResult[];
  blocked: string[];
};

export function splitCommandLines(commands: string): string[] {
  return commands
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"));
}

function isSafeRedirectTarget(target: string): boolean {
  if (!target) return true;
  if (target.startsWith("&")) return true;
  if (target.startsWith("/")) return false;
  if (target.startsWith("~")) return false;
  if (target.includes("..")) return false;
  if (target.startsWith("$")) return false;
  if (target.includes("`")) return false;
  return true;
}

function stripQuoted(s: string): string {
  return s.replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, "");
}

function isSimpleCommandWhitelisted(
  cmd: string,
  whitelist: string[],
): boolean {
  const trimmed = cmd.trim();
  if (!trimmed) return true;

  let baseCmd = trimmed;
  let redirectTarget: string | null = null;

  const redirectMatch = trimmed.match(/^(.*?)\s*(>>?|<)\s*(\S+)\s*$/);
  if (redirectMatch) {
    baseCmd = redirectMatch[1].trim();
    redirectTarget = redirectMatch[3].trim();

    // Only reject angle brackets OUTSIDE of quoted strings so that
    // `echo "<h1>" > file` still passes.
    if (/[<>]/.test(stripQuoted(baseCmd))) return false;

    if (!isSafeRedirectTarget(redirectTarget)) return false;
  }

  for (const entry of whitelist) {
    if (!entry) continue;

    if (entry.startsWith("/") && entry.endsWith("/") && entry.length > 2) {
      try {
        if (new RegExp(entry.slice(1, -1)).test(baseCmd)) return true;
      } catch {}
      continue;
    }

    if (entry.endsWith("*")) {
      const prefix = entry.slice(0, -1).trimEnd();
      if (prefix && baseCmd.startsWith(prefix)) return true;
      continue;
    }

    if (entry.includes(" ")) {
      if (baseCmd === entry || baseCmd.startsWith(entry + " ")) return true;
      continue;
    }

    const firstToken = baseCmd.split(/\s+/)[0];
    if (firstToken === entry) return true;
  }

  return false;
}

export function isLineWhitelisted(
  line: string,
  whitelist: string[],
): boolean {
  const trimmed = line.trim();
  if (!trimmed) return true;
  if (trimmed.startsWith("#")) return true;

  if (/\||`|\$\(/.test(trimmed)) {
    for (const entry of whitelist) {
      if (entry.startsWith("/") && entry.endsWith("/") && entry.length > 2) {
        try {
          if (new RegExp(entry.slice(1, -1)).test(trimmed)) return true;
        } catch {}
      }
    }
    return false;
  }

  const parts = trimmed.split(/\s*(?:&&|\|\||;)\s*/);
  return parts.every((p) => isSimpleCommandWhitelisted(p, whitelist));
}

export function checkCommandsWhitelist(
  commands: string,
  whitelist: string[],
): WhitelistCheckResult {
  const lines = splitCommandLines(commands);
  const results: WhitelistLineResult[] = lines.map((line) => ({
    line,
    allowed: isLineWhitelisted(line, whitelist),
  }));
  const blocked = results.filter((r) => !r.allowed).map((r) => r.line);
  return { allAllowed: blocked.length === 0, lines: results, blocked };
}

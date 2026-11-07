export type Danger = { label: string; reason: string; sample: string };

const PATTERNS: { pattern: RegExp; label: string; reason: string }[] = [
  {
    pattern: /rm\s+-rf\s+(\/|\/\*|~)(\s|$)/i,
    label: "rm -rf /",
    reason: "Deletes the entire filesystem or home directory.",
  },
  {
    pattern: /\bmkfs(\.\w+)?\b/i,
    label: "mkfs",
    reason: "Formats a disk partition, destroying all data on it.",
  },
  {
    pattern: /\bdd\s+if=/i,
    label: "dd if=",
    reason: "Writes raw data to a device — can overwrite your disk.",
  },
  {
    pattern: /chmod\s+-R\s+777\s+\/(\s|$)/i,
    label: "chmod -R 777 /",
    reason: "Destroys system file permissions.",
  },
  {
    pattern: /chown\s+-R\s+[^\s]+\s+\/(\s|$)/i,
    label: "chown -R on /",
    reason: "Destroys system ownership.",
  },
  {
    pattern: /\b(shutdown|reboot|poweroff)\b/i,
    label: "shutdown/reboot",
    reason: "Powers down or restarts the machine.",
  },
  { pattern: /\binit\s+0\b/i, label: "init 0", reason: "Halts the system." },
  {
    pattern: /:\(\)\s*\{[^}]*\|[^}]*&[^}]*\}\s*;\s*:/,
    label: "fork bomb",
    reason: "Spawns infinite processes and locks the machine.",
  },
  {
    pattern: /\b(curl|wget)\b[^\n|]*\|\s*(bash|sh|zsh)\b/i,
    label: "curl | bash",
    reason: "Pipes a remote script directly into a shell.",
  },
];

/**
 * Removes the bodies of heredocs so file contents that merely *mention*
 * dangerous commands (docs, tests, sample code) don't trigger alerts.
 */
function stripHeredocBodies(script: string): string {
  const lines = script.split("\n");
  const out: string[] = [];
  let terminator: string | null = null;

  for (const line of lines) {
    if (terminator) {
      if (line.trim() === terminator) {
        terminator = null;
        out.push(line);
      }
      continue;
    }

    const m = line.match(/<<-?\s*['"]?([A-Za-z_][A-Za-z0-9_]*)['"]?/);
    if (m) terminator = m[1];

    out.push(line);
  }

  return out.join("\n");
}

export function isSensitiveCommand(line: string): boolean {
  return /\b(cat|less|more|head|tail|grep|rg|cp|mv|rm|nano|vim|vi)\b[^\n|&;]*\.(env|env\.\w+|pem|key|p12|pfx|keystore|npmrc|pypirc|netrc|htpasswd|git-credentials)\b/i.test(
    line,
  );
}

export function scanDangerous(terminal: string): Danger[] {
  const commandsOnly = stripHeredocBodies(terminal);
  const found: Danger[] = [];

  for (const { pattern, label, reason } of PATTERNS) {
    pattern.lastIndex = 0;
    const match = commandsOnly.match(pattern);
    if (match) found.push({ label, reason, sample: match[0] });
  }

  return found;
}

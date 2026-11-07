/**
 * Unicode characters that break shells or render as invisible noise.
 * IMEs, editors, and copy-paste from RTL contexts inject them silently.
 * They look like nothing in the UI but bash treats them as real bytes and
 * blows up with "syntax error near unexpected token" on otherwise fine lines.
 */
const INVISIBLE_RE = new RegExp(
  [
    "\\uFEFF", // BOM / zero-width no-break space
    "\\u200B", // zero-width space
    "\\u200C", // zero-width non-joiner
    "\\u200D", // zero-width joiner
    "\\u200E", // left-to-right mark
    "\\u200F", // right-to-left mark
    "\\u202A", // LRE
    "\\u202B", // RLE
    "\\u202C", // PDF
    "\\u202D", // LRO
    "\\u202E", // RLO
    "\\u2066", // LRI
    "\\u2067", // RLI
    "\\u2068", // FSI
    "\\u2069", // PDI
    "\\uFE00-\\uFE0F", // variation selectors
    "\\u00A0", // no-break space
    "\\u2000-\\u200A", // en/em/thin/hair/… spaces
    "\\u202F", // narrow no-break space
    "\\u205F", // medium mathematical space
    "\\u3000", // ideographic space
    "\\u2028", // line separator
    "\\u2029", // paragraph separator
    "\\uFFFC", // object replacement character
  ].join("|"),
  "g",
);

export function stripInvisible(s: string): string {
  return s.replace(INVISIBLE_RE, "");
}

/**
 * Sanitizes and normalizes text for typing engine:
 * 1. Converts smart quotes “ ” to "
 * 2. Converts smart apostrophes ‘ ’ to '
 * 3. Converts em-dash —, en-dash – to standard hyphen -
 * 4. Removes \u00A0 (non-breaking spaces) and exotic zero-width characters
 * 5. Strips emojis and unsupported non-ASCII / non-Latin typography
 * 6. Normalizes multiple spaces into a single space
 */
export function sanitizeTextForTyping(raw: string): string {
  if (!raw) return "";

  const cleaned = raw
    // Smart double quotes
    .replace(/[\u201C\u201D\u201E\u201F\u00AB\u00BB]/g, '"')
    // Smart single quotes & apostrophes
    .replace(/[\u2018\u2019\u201A\u201B\u2032\u02BC]/g, "'")
    // Em dash, En dash, horizontal bar
    .replace(/[\u2013\u2014\u2015]/g, "-")
    // Non-breaking spaces and zero-width characters
    .replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000\uFEFF]/g, " ")
    .replace(/[\u200B\u200C\u200D\u2060]/g, "")
    // Ellipsis … to ...
    .replace(/\u2026/g, "...")
    // Strip emojis
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "")
    // Normalize newlines to spaces
    .replace(/\r\n|\r|\n/g, " ")
    // Collapse multiple whitespace
    .replace(/\s+/g, " ")
    .trim();

  return cleaned;
}

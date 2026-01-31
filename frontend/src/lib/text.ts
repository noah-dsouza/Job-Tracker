export function getDisplayLabel(text: string | undefined, maxLength = 96): string {
  if (!text) return "";

  let cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return "";

  const newlineIndex = cleaned.indexOf("\n");
  if (newlineIndex !== -1) {
    cleaned = cleaned.slice(0, newlineIndex).trim();
  }

  const lower = cleaned.toLowerCase();
  if (lower.startsWith("posted on")) {
    const agoIndex = lower.indexOf("ago");
    if (agoIndex !== -1) {
      cleaned = cleaned.slice(agoIndex + 3).trim();
      cleaned = cleaned.replace(/^[-–—]/, "").trim();
    }
  }

  if (cleaned.length > maxLength) {
    return `${cleaned.slice(0, maxLength).trimEnd()}…`;
  }

  return cleaned;
}

export function chunkDescription(description: string | undefined): string[] {
  if (!description) return [];

  const normalized = description.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const newlineChunks = normalized
    .split(/\n{2,}|\n-\s*/g)
    .map((chunk) => chunk.trim())
    .filter(Boolean);
  if (newlineChunks.length > 1) {
    return newlineChunks;
  }

  const postedChunks = normalized
    .split(/(?=Posted on\s)/i)
    .map((chunk) => chunk.trim())
    .filter(Boolean);
  if (postedChunks.length > 1) {
    return postedChunks;
  }

  const sentenceChunks =
    normalized.match(/[^.!?]+[.!?]?/g)?.map((chunk) => chunk.trim()).filter(Boolean) ??
    [];

  return sentenceChunks.length ? sentenceChunks : [normalized];
}

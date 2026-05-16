// Daxno: human-friendly formatting for backend ISO timestamps embedded in
// error / quota toast messages (e.g. "come back <ISO>").
//
// Mirrors `daxno-rag/web/src/lib/format-time.ts` so the two surfaces show
// the same countdown style. Keep them in sync if you tweak one.

// ISO 8601 with timezone (Z or +HH:MM). Matches what `datetime.isoformat()`
// emits for a timezone-aware datetime, including microsecond variants.
const ISO_8601_TZ =
  /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})/;

/**
 * Format the remaining time until an ISO timestamp as a coarse countdown:
 *   - "23h, 59min, 34sec"
 *   - "0h, 5min, 12sec"
 *   - "any moment" if the target is in the past
 *
 * Snapshot at the moment the function is called. Returns the raw ISO
 * unchanged if parsing fails — never throws.
 */
export function formatRemainingDuration(iso: string): string {
  const target = new Date(iso);
  if (isNaN(target.getTime())) return iso;

  const ms = target.getTime() - Date.now();
  if (ms <= 0) return "any moment";

  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${h}h, ${m}min, ${s}sec`;
}

/**
 * Extract the first ISO 8601 timestamp from a string, returning it (so you can
 * format it yourself) or `null` if none is present.
 */
export function extractIso(message: string): string | null {
  const match = message.match(ISO_8601_TZ);
  return match ? match[0] : null;
}

/**
 * Replace the first ISO 8601 timestamp inside a message with the remaining
 * duration until that timestamp ("23h, 59min, 34sec"). If no ISO is found,
 * returns the input unchanged.
 */
export function localizeIsoInMessage(message: string): string {
  const iso = extractIso(message);
  if (!iso) return message;
  return message.replace(iso, formatRemainingDuration(iso));
}

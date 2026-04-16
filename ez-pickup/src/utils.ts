// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

/**
 * AviationStack returns local airport times but incorrectly appends a UTC
 * offset (e.g. "2026-04-15T09:35:00+00:00"). Passing that directly to
 * `new Date()` causes the browser to shift the value by the user's UTC offset.
 *
 * This function strips any trailing offset (+HH:MM, -HH:MM) or "Z" so that
 * `new Date()` treats the value as a plain local (wall-clock) time.
 */
export function stripUtcOffset(iso: string | null): string | null {
  if (!iso) return null;
  // Remove trailing Z or ±HH:MM / ±HHMM offset
  return iso.replace(/([+-]\d{2}:?\d{2}|Z)$/, '');
}

/**
 * Formats a YYYY-MM-DD date string as a human-readable date, e.g. "April 30, 2026".
 *
 * Parsing uses UTC (timeZone: 'UTC') so that a bare date like "2026-04-30" is
 * never shifted into the previous day by the browser's local UTC offset.
 */
export function formatDisplayDate(isoDate: string | null | undefined): string {
  if (!isoDate) return '—';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(isoDate));
}

/**
 * Formats a bare HH:MM string (from <input type="time">) as a 12-hour time,
 * e.g. "09:35" → "9:35 AM". Returns "—" for null/empty input.
 *
 * Constructs a dummy date at the given time in the local timezone so no
 * offset shifting can occur.
 */
export function formatTime(hhmm: string | null | undefined): string {
  if (!hhmm) return '—';
  const [hours, minutes] = hhmm.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return '—';
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

/**
 * Compares an ISO date string (YYYY-MM-DD) against today's local date.
 * Returns 'future' if the date is after today, 'past' if before, or null if
 * the string is missing or unparseable.
 */
export function dateRelativeToToday(isoDate: string | null | undefined): 'future' | 'past' | null {
  if (!isoDate) return null;
  const today = new Date().toISOString().split('T')[0];
  if (isoDate > today) return 'future';
  if (isoDate < today) return 'past';
  return null;
}

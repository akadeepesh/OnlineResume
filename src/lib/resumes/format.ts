const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** "just now", "5 min ago", "3 h ago", "2 days ago", then "12 Nov 2026". */
export function editedLabel(date: Date, now: Date): string {
  const elapsed = Math.max(0, now.getTime() - date.getTime());
  if (elapsed < MINUTE) return "just now";
  if (elapsed < HOUR) return `${Math.floor(elapsed / MINUTE)} min ago`;
  if (elapsed < DAY) return `${Math.floor(elapsed / HOUR)} h ago`;
  const days = Math.floor(elapsed / DAY);
  if (days < 7) return days === 1 ? "yesterday" : `${days} days ago`;
  // Fixed locale and time zone: rendered on the server, must not depend on its settings.
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

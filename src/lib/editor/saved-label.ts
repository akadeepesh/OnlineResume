const MINUTE = 60_000;

/** "Saved just now", "Saved 3 min ago", then "Saved at 14:05". */
export function savedLabel(savedAt: number, now: number): string {
  const minutes = Math.floor(Math.max(0, now - savedAt) / MINUTE);
  if (minutes < 1) return "Saved just now";
  if (minutes < 60) return `Saved ${minutes} min ago`;
  const time = new Date(savedAt).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return `Saved at ${time}`;
}

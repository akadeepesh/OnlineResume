// ============================================================================
// Free-text date ranges ("Mar 2021 – Present") ↔ the partial ISO dates other
// formats use ("2021-03"). People type dates any way they like, so parsing is
// best-effort: what we can't read confidently is left out, never guessed.
// ============================================================================

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const ONGOING = /^(present|now|current|ongoing|today)$/i;

/** "2021", "Mar 2021", "March 2021", "03/2021", "2021-03" → "2021" or "2021-03". Null if unreadable. */
export function toIsoPartial(text: string): string | null {
  const value = text.trim().replace(/\.$/, "");
  let match = /^(\d{4})$/.exec(value);
  if (match) return match[1]!;
  match = /^(\d{4})-(\d{1,2})(?:-\d{1,2})?$/.exec(value);
  if (match) return month(match[1]!, Number(match[2]));
  match = /^(\d{1,2})[/.](\d{4})$/.exec(value);
  if (match) return month(match[2]!, Number(match[1]));
  match = /^([a-z]+)\.?\s+(\d{4})$/i.exec(value);
  if (match) {
    const index = MONTHS.indexOf(match[1]!.slice(0, 3).toLowerCase());
    if (index >= 0) return month(match[2]!, index + 1);
  }
  return null;
}

function month(year: string, m: number): string | null {
  return m >= 1 && m <= 12 ? `${year}-${String(m).padStart(2, "0")}` : null;
}

export interface IsoRange {
  startDate?: string;
  endDate?: string;
}

/** "Mar 2021 – Present" → { startDate: "2021-03" }; "2019 - 2021" → both. */
export function parseDateRange(text: string | undefined): IsoRange {
  if (!text?.trim()) return {};
  const parts = text.split(/\s*(?:–|—|-{1,2}|\bto\b)\s*(?=\S)/i).filter((part) => part.trim() !== "");
  // A single ISO date like "2021-03" also contains a hyphen; try it whole first.
  const whole = toIsoPartial(text);
  if (whole) return { startDate: whole };
  if (parts.length === 1) {
    const start = toIsoPartial(parts[0]!);
    return start ? { startDate: start } : {};
  }
  if (parts.length !== 2) return {};
  const start = toIsoPartial(parts[0]!);
  if (!start) return {};
  if (ONGOING.test(parts[1]!.trim())) return { startDate: start };
  const end = toIsoPartial(parts[1]!);
  return end ? { startDate: start, endDate: end } : { startDate: start };
}

/** "2021-03" → "Mar 2021", "2021" → "2021". Unknown shapes come back as they were. */
export function fromIsoPartial(iso: string): string {
  const match = /^(\d{4})(?:-(\d{2}))?/.exec(iso.trim());
  if (!match) return iso.trim();
  const m = match[2] ? Number(match[2]) : 0;
  return m >= 1 && m <= 12 ? `${MONTH_LABELS[m - 1]} ${match[1]}` : match[1]!;
}

/** { startDate, endDate } → "Mar 2021 – Present". Empty when there's no start. */
export function formatDateRange(startDate?: string, endDate?: string): string {
  if (!startDate?.trim()) return endDate?.trim() ? fromIsoPartial(endDate) : "";
  const start = fromIsoPartial(startDate);
  return `${start} – ${endDate?.trim() ? fromIsoPartial(endDate) : "Present"}`;
}

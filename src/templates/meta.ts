// Lightweight template metadata (safe to import from client components).

export const templateMeta = [
  {
    slug: "classic",
    name: "Classic",
    description: "Sidebar profile with clean content cards",
    swatch: ["#f5f6f8", "#0f172a", "#4f46e5"],
  },
  {
    slug: "editorial",
    name: "Editorial",
    description: "Print-inspired serif document on paper",
    swatch: ["#f6f3ec", "#1c1917", "#8b2c24"],
  },
  {
    slug: "spotlight",
    name: "Spotlight",
    description: "Dark split-screen with sticky navigation",
    swatch: ["#0b1120", "#cbd5e1", "#5eead4"],
  },
  {
    slug: "terminal",
    name: "Terminal",
    description: "Interactive shell — visitors can type commands",
    swatch: ["#0d1117", "#c9d1d9", "#7ee787"],
  },
  {
    slug: "bento",
    name: "Bento",
    description: "Modern tile grid, dashboard style",
    swatch: ["#efeeea", "#ffffff", "#ff5b2e"],
  },
  {
    slug: "plain",
    name: "Plain",
    description: "Single column, ATS-friendly, prints cleanly",
    swatch: ["#ffffff", "#171717", "#525252"],
  },
] as const;

export type TemplateSlug = (typeof templateMeta)[number]["slug"];

/**
 * Templates that look right on paper. "Download PDF" uses the resume's own
 * template when it's here, and Plain otherwise (screen designs with dark
 * backgrounds, animations or interactive parts don't print well).
 */
export const PRINTABLE_TEMPLATES: readonly TemplateSlug[] = ["plain"];

export const printTemplateFor = (slug: TemplateSlug): TemplateSlug =>
  PRINTABLE_TEMPLATES.includes(slug) ? slug : "plain";

export const isTemplateSlug = (value: string): value is TemplateSlug =>
  templateMeta.some((t) => t.slug === value);

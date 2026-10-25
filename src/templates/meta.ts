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
] as const;

export type TemplateSlug = (typeof templateMeta)[number]["slug"];

export const isTemplateSlug = (value: string): value is TemplateSlug =>
  templateMeta.some((t) => t.slug === value);

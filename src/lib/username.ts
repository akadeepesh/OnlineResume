// ============================================================================
// Usernames: the first part of every public link (/<username>).
//
// Rules: 3–30 characters, lowercase letters, digits and single hyphens, not
// starting or ending with a hyphen. Stored lowercase; input is lowercased
// before checking, so "Jane-Doe" claims "jane-doe".
//
// Reserved names cover every top-level route (a username must never shadow a
// page) plus names that could pass for something official.
// ============================================================================

export const USERNAME_MIN = 3;
export const USERNAME_MAX = 30;

const RESERVED = new Set([
  // Routes and files at the site root, now or planned
  "api", "auth", "dashboard", "editor", "onboarding", "print", "templates", "settings",
  "sign-in", "sign-up", "sign-out", "signin", "signup", "signout", "login", "logout", "register",
  "account", "accounts", "new", "edit", "import", "export", "preview", "share",
  "_next", "static", "public", "assets", "images", "img", "fonts", "favicon", "robots", "sitemap",
  "manifest", "og", "icon", "apple-icon",
  // Product and legal pages
  "about", "blog", "changelog", "contact", "docs", "faq", "features", "help", "home", "jobs",
  "careers", "legal", "pricing", "privacy", "terms", "security", "status", "support", "explore",
  "search", "examples", "resume", "resumes", "cv", "user", "users", "u", "me", "profile", "team",
  // Names that could pass for staff or the system
  "admin", "administrator", "root", "system", "staff", "moderator", "official", "owner",
  "onlineresume", "webmaster", "hostmaster", "postmaster", "noreply", "no-reply", "mail", "email",
  "www", "app", "dev", "test", "staging", "null", "undefined", "anonymous", "guest",
]);

export type UsernameCheck = { ok: true; username: string } | { ok: false; reason: string };

/** Lowercase and trim, nothing else: what the user typed is what gets checked. */
export const normalizeUsername = (raw: string) => raw.trim().toLowerCase();

export function validateUsername(raw: string): UsernameCheck {
  const username = normalizeUsername(raw);
  if (username.length < USERNAME_MIN) return { ok: false, reason: `Use at least ${USERNAME_MIN} characters.` };
  if (username.length > USERNAME_MAX) return { ok: false, reason: `Use at most ${USERNAME_MAX} characters.` };
  if (!/^[a-z0-9-]+$/.test(username)) return { ok: false, reason: "Use only letters, numbers and hyphens." };
  if (username.startsWith("-") || username.endsWith("-")) {
    return { ok: false, reason: "Don't start or end with a hyphen." };
  }
  if (username.includes("--")) return { ok: false, reason: "Use one hyphen at a time." };
  if (RESERVED.has(username)) return { ok: false, reason: "That name is reserved." };
  return { ok: true, username };
}

/**
 * A valid starting suggestion from the user's name or email, e.g.
 * "José Núñez" → "jose-nunez". Not checked for availability.
 */
export function suggestUsername(name: string, email: string): string {
  const slug = (value: string) =>
    value
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "") // accents
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, USERNAME_MAX)
      .replace(/-+$/, "");

  for (const candidate of [slug(name), slug(email.split("@")[0] ?? "")]) {
    if (validateUsername(candidate).ok) return candidate;
    // Short or reserved: pad it so it becomes usable ("al" → "al-resume").
    const padded = `${candidate}-resume`.replace(/^-/, "");
    if (candidate && validateUsername(padded).ok) return padded;
  }
  return "";
}

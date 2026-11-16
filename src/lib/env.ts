import { z } from "zod";

// ============================================================================
// Environment variables, validated once with zod.
//
// - Client vars (NEXT_PUBLIC_*) are read with literal `process.env.NAME`
//   expressions: Next.js only inlines them into the browser bundle when it
//   can see the full name.
// - Server vars are read lazily through `serverEnv()`, which refuses to run in
//   the browser, so a secret can't end up in client code by accident.
// - Blank values count as unset: Vercel and .env files often hold "".
//
// Every variable is documented in .env.example and docs/SETUP.md.
// ============================================================================

/** "" → undefined, so defaults and optional() treat blank values as unset. */
const blankAsUnset = (value: unknown) => (typeof value === "string" && value.trim() === "" ? undefined : value);

const flag = (fallback: boolean) =>
  z.preprocess(
    blankAsUnset,
    z
      .enum(["true", "false"])
      .default(fallback ? "true" : "false")
      .transform((value) => value === "true"),
  );

const text = () => z.preprocess(blankAsUnset, z.string().trim().optional());

export const clientEnvSchema = z.object({
  /** Public base URL, e.g. https://resume.akadeepesh.com. Used for metadata and absolute links. */
  NEXT_PUBLIC_SITE_URL: z.preprocess(blankAsUnset, z.url().default("http://localhost:3000")),
  /** Template shown at "/" (classic, editorial, spotlight, terminal, bento). Unknown values fall back to classic. */
  NEXT_PUBLIC_TEMPLATE: text(),
  /** Floating template picker on "/" and /templates/<slug>. */
  NEXT_PUBLIC_SHOW_TEMPLATE_SWITCHER: flag(true),
  /** Live repo stats for skill links. Leftover from the portfolio; goes away with skill → project links. */
  NEXT_PUBLIC_ENABLE_GITHUB_FETCH: flag(false),
  /** GitHub account the repo stats are read from. Same leftover as above. */
  NEXT_PUBLIC_GH_OWNER: text(),
});

export const serverEnvSchema = z.object({
  /** Neon Postgres connection string. Optional: only accounts and saved resumes need it. */
  DATABASE_URL: z.preprocess(
    blankAsUnset,
    z
      .string()
      .trim()
      .regex(/^postgres(ql)?:\/\//, "must be a postgres:// or postgresql:// connection string")
      .optional(),
  ),
  /** Raises GitHub's API rate limit for repo stats. Optional. */
  GITHUB_TOKEN: text(),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

/** Validate a set of variables, or throw one error that names every bad one. */
export function parseEnv<S extends z.ZodType>(schema: S, source: Record<string, string | undefined>): z.infer<S> {
  const result = schema.safeParse(source);
  if (result.success) return result.data;
  const problems = result.error.issues.map((issue) => `  ${issue.path.join(".")}: ${issue.message}`).join("\n");
  throw new Error(`Invalid environment variables (see .env.example):\n${problems}`);
}

export const clientEnv: ClientEnv = parseEnv(clientEnvSchema, {
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_TEMPLATE: process.env.NEXT_PUBLIC_TEMPLATE,
  NEXT_PUBLIC_SHOW_TEMPLATE_SWITCHER: process.env.NEXT_PUBLIC_SHOW_TEMPLATE_SWITCHER,
  NEXT_PUBLIC_ENABLE_GITHUB_FETCH: process.env.NEXT_PUBLIC_ENABLE_GITHUB_FETCH,
  NEXT_PUBLIC_GH_OWNER: process.env.NEXT_PUBLIC_GH_OWNER,
});

let cachedServerEnv: ServerEnv | undefined;

/** Server-only variables. Throws if called in the browser. */
export function serverEnv(): ServerEnv {
  if (typeof window !== "undefined") {
    throw new Error("serverEnv() was called in the browser. Server variables must stay on the server.");
  }
  cachedServerEnv ??= parseEnv(serverEnvSchema, process.env);
  return cachedServerEnv;
}

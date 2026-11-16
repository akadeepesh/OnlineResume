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
// Every variable is documented in .env.example.
// ============================================================================

/** "" → undefined, so defaults and optional() treat blank values as unset. */
const blankAsUnset = (value: unknown) => (typeof value === "string" && value.trim() === "" ? undefined : value);

const text = () => z.preprocess(blankAsUnset, z.string().trim().optional());

export const clientEnvSchema = z.object({
  /** Public base URL, e.g. https://resume.akadeepesh.com. Used for metadata and absolute links. */
  NEXT_PUBLIC_SITE_URL: z.preprocess(blankAsUnset, z.url().default("http://localhost:3000")),
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
  /** Signs session cookies and tokens. Required in production once DATABASE_URL is set. `openssl rand -base64 32` */
  BETTER_AUTH_SECRET: z.preprocess(blankAsUnset, z.string().trim().min(32, "must be at least 32 characters").optional()),
  /** Base URL Better Auth uses for OAuth callbacks. Defaults to NEXT_PUBLIC_SITE_URL. */
  BETTER_AUTH_URL: z.preprocess(blankAsUnset, z.url().optional()),
  /** Google sign-in. Both id and secret are needed, or the button is hidden. */
  GOOGLE_CLIENT_ID: text(),
  GOOGLE_CLIENT_SECRET: text(),
  /** GitHub sign-in (and repo import later). Both id and secret are needed, or the button is hidden. */
  GITHUB_CLIENT_ID: text(),
  GITHUB_CLIENT_SECRET: text(),
  /** Groq API key for AI-assisted import from pasted text. Off when unset. */
  GROQ_API_KEY: text(),
  /** Groq model for AI import. Defaults to a Llama 3.3 70B model. */
  GROQ_MODEL: text(),
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

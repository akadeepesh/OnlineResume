import { defineConfig } from "drizzle-kit";

// drizzle-kit doesn't read .env files, and Next.js isn't running here, so load
// the same file `next dev` uses. Missing file is fine (CI sets real env vars).
try {
  process.loadEnvFile(".env.local");
} catch {
  // no .env.local
}

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
  strict: true,
  verbose: true,
});

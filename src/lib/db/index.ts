import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { serverEnv } from "@/lib/env";
import * as schema from "./schema";

// ============================================================================
// Database client: Neon over HTTP. Each query is one HTTPS request, which
// suits serverless functions (no connection pool to warm up or leak).
// Interactive transactions aren't available on HTTP; use `db().batch([...])`
// for several writes that must succeed together (it runs as one transaction).
//
// Created lazily: the guest editor and template pages work without a
// database, so a missing DATABASE_URL only fails code that actually queries.
// ============================================================================

const createDb = (url: string) => drizzle(neon(url), { schema });
export type Database = ReturnType<typeof createDb>;

let instance: Database | undefined;

export function db(): Database {
  if (instance) return instance;
  const { DATABASE_URL } = serverEnv();
  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. See .env.example.");
  }
  instance = createDb(DATABASE_URL);
  return instance;
}

export { schema };

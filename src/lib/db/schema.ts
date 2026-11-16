import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import type { Resume } from "@/lib/resume/schema";
import type { TemplateSlug } from "@/templates/meta";
import { bytea } from "./bytea";

// ============================================================================
// Database schema (Neon Postgres + Drizzle).
//
// - `users`, `sessions`, `accounts` and `verifications` are Better Auth's
//   tables (see lib/auth). Their JS keys must match Better Auth's field names;
//   `users` adds our own `username` and `plan`.
// - `resumes.data` is the zod `Resume` as jsonb. Rows are untrusted like any
//   other input: read them through `parseResume` (which also migrates old
//   schema versions) before use.
// - Limits per plan (number of resumes, AI imports a day) live in
//   `lib/limits.ts` (PR 14), not in constraints, so plans can change freely.
// ============================================================================

/** Plans are plain text so adding a paid plan needs no migration. */
export type Plan = "free";

/** Largest original upload we store, in bytes (5 MB). */
export const MAX_ORIGINAL_FILE_BYTES = 5 * 1024 * 1024;

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const users = pgTable("users", {
  // Better Auth generates text ids.
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  /** Chosen during onboarding (PR 13), stored lowercase. Null until then. */
  username: text("username").unique(),
  plan: text("plan").$type<Plan>().notNull().default("free"),
  ...timestamps,
});

/** Signed-in browsers. Better Auth reads and writes these. */
export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    ...timestamps,
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

/**
 * How a user signs in: one row per provider ("credential" for email +
 * password, "google", "github"). `password` holds the hash for credential rows.
 */
export const accounts = pgTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
    scope: text("scope"),
    password: text("password"),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("accounts_provider_account_idx").on(t.providerId, t.accountId),
    index("accounts_user_idx").on(t.userId),
  ],
);

/** Short-lived tokens (OAuth state, and later email verification / password reset). */
export const verifications = pgTable(
  "verifications",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ...timestamps,
  },
  (t) => [index("verifications_identifier_idx").on(t.identifier)],
);

export const resumes = pgTable(
  "resumes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    /** Part of the public link: /<username>/<slug>. Unique per user. */
    slug: text("slug").notNull(),
    template: text("template").$type<TemplateSlug>().notNull().default("classic"),
    data: jsonb("data").$type<Resume>().notNull(),
    /** Shown at /<username>. At most one per user. */
    isPrimary: boolean("is_primary").notNull().default(false),
    /** Unpublished resumes 404 for everyone except their owner. */
    isPublished: boolean("is_published").notNull().default(false),
    /** Hide from search engines. On by default. */
    noindex: boolean("noindex").notNull().default(true),
    ...timestamps,
  },
  (t) => [
    // Also serves "all resumes of a user" lookups (user_id is its first column).
    uniqueIndex("resumes_user_slug_idx").on(t.userId, t.slug),
    uniqueIndex("resumes_one_primary_per_user_idx").on(t.userId).where(sql`${t.isPrimary}`),
  ],
);

/** The file a resume was imported from, kept untouched for "Download original". */
export const resumeFiles = pgTable(
  "resume_files",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    resumeId: uuid("resume_id")
      .notNull()
      .unique()
      .references(() => resumes.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    fileName: text("file_name").notNull(),
    mimeType: text("mime_type").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    content: bytea("content").notNull(),
    /** Field → position in the original (PR 22), for edited-original export. */
    sourceMap: jsonb("source_map"),
    /** Owner allows visitors to download the original from the public page. */
    allowDownload: boolean("allow_download").notNull().default(false),
    createdAt: timestamps.createdAt,
  },
  (t) => [
    check("resume_files_size_check", sql`${t.sizeBytes} > 0 and ${t.sizeBytes} <= ${sql.raw(String(MAX_ORIGINAL_FILE_BYTES))}`),
    index("resume_files_user_idx").on(t.userId),
  ],
);

/** AI imports per user per day, for the daily cap (PR 23). */
export const aiUsage = pgTable(
  "ai_usage",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    day: date("day").notNull(),
    count: integer("count").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.userId, t.day] })],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type ResumeRow = typeof resumes.$inferSelect;
export type NewResumeRow = typeof resumes.$inferInsert;
export type ResumeFile = typeof resumeFiles.$inferSelect;
export type NewResumeFile = typeof resumeFiles.$inferInsert;

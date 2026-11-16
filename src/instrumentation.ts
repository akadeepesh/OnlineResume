import * as Sentry from "@sentry/nextjs";
import { SENTRY_DATA_COLLECTION } from "@/lib/sentry";

// ============================================================================
// Error monitoring on the server (Sentry). Off unless SENTRY_DSN is set. No
// personal data is collected (see lib/sentry.ts) and no performance tracing,
// so only errors with their stack traces leave the server.
// ============================================================================

export function register() {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;
  Sentry.init({
    dsn,
    dataCollection: { ...SENTRY_DATA_COLLECTION, httpBodies: [] },
    tracesSampleRate: 0,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
  });
}

/** Errors thrown while rendering pages, route handlers and server actions. */
export const onRequestError = Sentry.captureRequestError;

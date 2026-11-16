import * as Sentry from "@sentry/nextjs";

// ============================================================================
// Error monitoring on the server (Sentry). Off unless SENTRY_DSN is set. No
// personal data is sent (sendDefaultPii: false) and no performance tracing,
// so only errors with their stack traces leave the server.
// ============================================================================

export function register() {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;
  Sentry.init({
    dsn,
    sendDefaultPii: false,
    tracesSampleRate: 0,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
  });
}

/** Errors thrown while rendering pages, route handlers and server actions. */
export const onRequestError = Sentry.captureRequestError;

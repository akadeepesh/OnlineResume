import * as Sentry from "@sentry/nextjs";
import { SENTRY_DATA_COLLECTION } from "@/lib/sentry";
import { clientEnv } from "@/lib/env";

// Error monitoring in the browser. Off unless NEXT_PUBLIC_SENTRY_DSN is set.
// No session replay, no tracing, no personal data.
if (clientEnv.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: clientEnv.NEXT_PUBLIC_SENTRY_DSN,
    dataCollection: { ...SENTRY_DATA_COLLECTION, httpBodies: [] },
    tracesSampleRate: 0,
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

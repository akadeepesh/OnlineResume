import * as Sentry from "@sentry/nextjs";
import { clientEnv } from "@/lib/env";

// Error monitoring in the browser. Off unless NEXT_PUBLIC_SENTRY_DSN is set.
// No session replay, no tracing, no personal data.
if (clientEnv.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: clientEnv.NEXT_PUBLIC_SENTRY_DSN,
    sendDefaultPii: false,
    tracesSampleRate: 0,
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

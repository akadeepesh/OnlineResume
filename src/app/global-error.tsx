"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

/** Last resort when the root layout itself fails. Plain HTML: the layout and its styles may be what broke. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0 }}>
        <main style={{ textAlign: "center", padding: 24 }}>
          <h1 style={{ fontSize: 22, margin: 0 }}>Something went wrong</h1>
          <p style={{ color: "#666", marginTop: 8 }}>Your saved work is safe. Please try again.</p>
          <button onClick={reset} style={{ marginTop: 16, padding: "8px 16px", cursor: "pointer" }}>
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}

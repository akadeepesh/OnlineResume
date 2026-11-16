"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

/** Shown when a page throws. Logs the error for the server logs and offers a retry. */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-6 text-center">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Something went wrong</h1>
      <p className="mt-2 max-w-sm text-sm text-neutral-500">
        Your saved work is safe. Try again, and if it keeps happening, come back in a few minutes.
      </p>
      {error.digest && <p className="mt-2 font-mono text-xs text-neutral-400">Reference: {error.digest}</p>}
      <div className="mt-6 flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" asChild>
          <a href="/">Go home</a>
        </Button>
      </div>
    </main>
  );
}

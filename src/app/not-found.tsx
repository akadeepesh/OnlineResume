import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-6 text-center">
      <p className="text-sm font-medium text-neutral-400">404</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900">This page doesn&apos;t exist</h1>
      <p className="mt-2 max-w-sm text-sm text-neutral-500">
        The link may be mistyped, or the resume may be private or no longer published.
      </p>
      <Button className="mt-6" asChild>
        <Link href="/">Go home</Link>
      </Button>
    </main>
  );
}

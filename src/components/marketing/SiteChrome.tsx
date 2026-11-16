import Link from "next/link";
import { Button } from "@/components/ui/button";

/** Top navigation for public pages. `signedIn` swaps sign-in links for the dashboard. */
export function SiteNav({ signedIn }: { signedIn: boolean }) {
  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200/70 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-6">
        <Link href="/" className="text-sm font-semibold text-neutral-900">
          OnlineResume
        </Link>
        <nav className="flex items-center gap-2 text-sm sm:gap-4" aria-label="Main">
          <Link href="/templates" className="hidden text-neutral-600 hover:text-neutral-900 sm:inline">
            Templates
          </Link>
          {signedIn ? (
            <Button size="sm" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Link href="/sign-in" className="text-neutral-600 hover:text-neutral-900">
                Sign in
              </Link>
              <Button size="sm" asChild>
                <Link href="/sign-up">Get started</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-neutral-500">
        <p>OnlineResume · open source under the MIT license</p>
        <nav className="flex gap-5" aria-label="Footer">
          <Link href="/templates" className="hover:text-neutral-900">
            Templates
          </Link>
          <Link href="/privacy" className="hover:text-neutral-900">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-neutral-900">
            Terms
          </Link>
          <a href="https://github.com/akadeepesh/OnlineResume" className="hover:text-neutral-900">
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}

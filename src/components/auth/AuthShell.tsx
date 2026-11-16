import Link from "next/link";

/** Centered card used by sign-in, sign-up and onboarding. */
export default function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <header className="px-6 py-5">
        <Link href="/" className="text-sm font-semibold text-neutral-900">
          OnlineResume
        </Link>
      </header>
      <main className="flex flex-1 items-start justify-center px-6 pb-16 pt-6 sm:items-center sm:pt-0">
        <div className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

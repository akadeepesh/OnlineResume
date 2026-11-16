import Link from "next/link";
import type { ReactNode } from "react";

/** Simple readable layout for the privacy policy and terms. */
export default function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-neutral-200">
        <div className="mx-auto flex h-14 max-w-2xl items-center px-6">
          <Link href="/" className="text-sm font-semibold text-neutral-900">
            OnlineResume
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">{title}</h1>
        <p className="mt-2 text-sm text-neutral-500">Last updated {updated}</p>
        <div className="mt-8 space-y-6 text-[15px] leading-7 text-neutral-700 [&_a]:font-medium [&_a]:text-neutral-900 [&_a]:underline [&_a]:underline-offset-4 [&_h2]:mt-10 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-neutral-900 [&_li]:mt-1 [&_ul]:list-disc [&_ul]:pl-5">
          {children}
        </div>
      </main>
    </div>
  );
}

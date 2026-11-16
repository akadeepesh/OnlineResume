import type { Metadata } from "next";
import Link from "next/link";
import SignOutButton from "@/components/auth/SignOutButton";
import { requireOnboarded } from "@/lib/auth/session";
import { clientEnv } from "@/lib/env";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

// Placeholder until the resume dashboard lands: proves the session works end to end.
export default async function DashboardPage() {
  const { user, username } = await requireOnboarded("/dashboard");
  const link = `${new URL(clientEnv.NEXT_PUBLIC_SITE_URL).host}/${username}`;

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Hi, {user.name}</h1>
          <p className="mt-1 text-sm text-neutral-500">Signed in as {user.email}</p>
          <p className="mt-1 text-sm text-neutral-500">
            Your link: <span className="font-medium text-neutral-900">{link}</span>
          </p>
        </div>
        <SignOutButton />
      </div>
      <p className="mt-10 text-sm text-neutral-500">
        Your saved resumes will show up here soon. Meanwhile,{" "}
        <Link href="/editor" className="font-medium text-neutral-900 underline-offset-4 hover:underline">
          open the editor
        </Link>
        .
      </p>
    </main>
  );
}

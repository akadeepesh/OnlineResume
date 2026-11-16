import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import UsernameForm from "@/components/auth/UsernameForm";
import { authPageHref, safeNext } from "@/lib/auth/redirect";
import { getSession, getUsername } from "@/lib/auth/session";
import { isUsernameTaken } from "@/lib/db/usernames";
import { clientEnv } from "@/lib/env";
import { suggestUsername } from "@/lib/username";

export const metadata: Metadata = {
  title: "Pick your username",
  robots: { index: false, follow: false },
};

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const next = safeNext((await searchParams).next);
  const session = await getSession();
  if (!session) redirect(authPageHref("sign-in", next));
  if (await getUsername(session.user.id)) redirect(next);

  const suggestion = suggestUsername(session.user.name, session.user.email);
  const suggestionAvailable = suggestion !== "" && !(await isUsernameTaken(suggestion));
  return (
    <AuthShell>
      <UsernameForm
        next={next}
        suggestion={suggestion}
        suggestionAvailable={suggestionAvailable}
        linkPrefix={`${new URL(clientEnv.NEXT_PUBLIC_SITE_URL).host}/`}
      />
    </AuthShell>
  );
}

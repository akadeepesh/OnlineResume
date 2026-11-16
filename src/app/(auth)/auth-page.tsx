import { redirect } from "next/navigation";
import AuthForm from "@/components/auth/AuthForm";
import { serverEnv } from "@/lib/env";
import { authErrorMessage } from "@/lib/auth/messages";
import { enabledProviders } from "@/lib/auth/providers";
import { safeNext } from "@/lib/auth/redirect";
import { isAuthConfigured } from "@/lib/auth/server";
import { getSession } from "@/lib/auth/session";

export type AuthSearchParams = Promise<Record<string, string | string[] | undefined>>;

/** Shared body of /sign-in and /sign-up. */
export async function AuthPage({ mode, searchParams }: { mode: "sign-in" | "sign-up"; searchParams: AuthSearchParams }) {
  if (!isAuthConfigured()) {
    return (
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">Accounts aren&apos;t set up here</h1>
        <p className="mt-2 text-sm text-neutral-500">
          This deployment has no database, so sign-in is off. The editor still works without an account.
        </p>
      </div>
    );
  }

  const params = await searchParams;
  const next = safeNext(params.next);
  if (await getSession()) redirect(next);

  const error = typeof params.error === "string" ? authErrorMessage(params.error) : undefined;
  return <AuthForm mode={mode} next={next} providers={enabledProviders(serverEnv())} initialError={error} />;
}

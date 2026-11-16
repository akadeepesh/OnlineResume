"use client";

import { IconBrandGithub, IconBrandGoogle } from "@tabler/icons-react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/client";
import { authErrorMessage } from "@/lib/auth/messages";
import type { SocialProvider } from "@/lib/auth/providers";
import { authPageHref } from "@/lib/auth/redirect";

type Mode = "sign-in" | "sign-up";

const PROVIDERS: Record<SocialProvider, { label: string; Icon: typeof IconBrandGoogle }> = {
  google: { label: "Google", Icon: IconBrandGoogle },
  github: { label: "GitHub", Icon: IconBrandGithub },
};

const COPY: Record<Mode, { title: string; subtitle: string; submit: string; switchText: string; switchLink: string }> = {
  "sign-in": {
    title: "Welcome back",
    subtitle: "Sign in to edit and share your resumes.",
    submit: "Sign in",
    switchText: "New here?",
    switchLink: "Create an account",
  },
  "sign-up": {
    title: "Create your account",
    subtitle: "Save your resume and get your own link.",
    submit: "Create account",
    switchText: "Already have an account?",
    switchLink: "Sign in",
  },
};

interface AuthFormProps {
  mode: Mode;
  /** Same-site path to go to afterwards (already checked with safeNext). */
  next: string;
  providers: SocialProvider[];
  /** Error from an OAuth redirect (?error=), already turned into a message. */
  initialError?: string;
}

export default function AuthForm({ mode, next, providers, initialError }: AuthFormProps) {
  const router = useRouter();
  const copy = COPY[mode];
  const [error, setError] = useState(initialError ?? "");
  // Which action is running: "email" or a provider. Everything is disabled meanwhile.
  const [pending, setPending] = useState<"email" | SocialProvider | null>(null);

  async function onSocial(provider: SocialProvider) {
    setError("");
    setPending(provider);
    const { error } = await authClient.signIn.social({
      provider,
      callbackURL: next,
      errorCallbackURL: authPageHref("sign-in", next),
    });
    // On success the browser is already leaving for the provider.
    if (error) {
      setError(authErrorMessage(error.code));
      setPending(null);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    setError("");
    setPending("email");

    const { error } =
      mode === "sign-up"
        ? await authClient.signUp.email({ name: String(form.get("name") ?? "").trim(), email, password })
        : await authClient.signIn.email({ email, password });

    if (error) {
      setError(authErrorMessage(error.code));
      setPending(null);
      return;
    }
    router.replace(next);
    router.refresh();
  }

  const busy = pending !== null;

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">{copy.title}</h1>
      <p className="mt-1 text-sm text-neutral-500">{copy.subtitle}</p>

      {providers.length > 0 && (
        <>
          <div className="mt-6 grid gap-2">
            {providers.map((provider) => {
              const { label, Icon } = PROVIDERS[provider];
              return (
                <Button
                  key={provider}
                  type="button"
                  variant="outline"
                  className="w-full gap-2"
                  disabled={busy}
                  onClick={() => onSocial(provider)}
                >
                  {pending === provider ? (
                    <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden />
                  ) : (
                    <Icon className="h-4 w-4" aria-hidden />
                  )}
                  Continue with {label}
                </Button>
              );
            })}
          </div>
          <div className="my-6 flex items-center gap-3 text-xs text-neutral-400">
            <span className="h-px flex-1 bg-neutral-200" />
            or with email
            <span className="h-px flex-1 bg-neutral-200" />
          </div>
        </>
      )}

      <form onSubmit={onSubmit} className={providers.length > 0 ? "grid gap-4" : "mt-6 grid gap-4"}>
        {mode === "sign-up" && (
          <div className="grid gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" autoComplete="name" required maxLength={100} disabled={busy} />
          </div>
        )}
        <div className="grid gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required disabled={busy} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
            required
            minLength={mode === "sign-up" ? 8 : undefined}
            maxLength={128}
            disabled={busy}
            aria-describedby={mode === "sign-up" ? "password-hint" : undefined}
          />
          {mode === "sign-up" && (
            <p id="password-hint" className="text-xs text-neutral-500">
              At least 8 characters.
            </p>
          )}
        </div>

        {error && (
          <p role="alert" className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={busy}>
          {pending === "email" && <Loader2 className="mr-2 h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden />}
          {copy.submit}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500">
        {copy.switchText}{" "}
        <Link
          href={authPageHref(mode === "sign-in" ? "sign-up" : "sign-in", next)}
          className="font-medium text-neutral-900 underline-offset-4 hover:underline"
        >
          {copy.switchLink}
        </Link>
      </p>
    </div>
  );
}

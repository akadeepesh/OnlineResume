"use client";

import { Check, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { claimUsername, checkUsername, type ClaimState } from "@/app/onboarding/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { normalizeUsername, USERNAME_MAX, validateUsername } from "@/lib/username";

type Status =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "available" }
  | { kind: "problem"; message: string };

const CHECK_DELAY_MS = 400;

interface UsernameFormProps {
  next: string;
  /** Prefilled, already valid (or empty). */
  suggestion: string;
  /** Checked on the server while rendering, so the form starts ready. */
  suggestionAvailable: boolean;
  /** "resume.example.com/" shown before the input. */
  linkPrefix: string;
}

export default function UsernameForm({ next, suggestion, suggestionAvailable, linkPrefix }: UsernameFormProps) {
  const [value, setValue] = useState(suggestion);
  const [status, setStatus] = useState<Status>(
    suggestionAvailable ? { kind: "available" } : suggestion ? { kind: "problem", message: "That username is taken." } : { kind: "idle" },
  );
  // The value that was last submitted: a claim error only applies to it.
  const [submitted, setSubmitted] = useState("");
  const [state, setState] = useState<ClaimState>({});
  const [submitting, setSubmitting] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  // Only the newest request may update the status; slower old ones are ignored.
  const latest = useRef(0);

  function scheduleCheck(raw: string) {
    clearTimeout(timer.current);
    // Bump first, so a request still in flight can't overwrite what follows.
    const id = ++latest.current;
    const local = validateUsername(raw);
    if (!raw.trim()) return setStatus({ kind: "idle" });
    if (!local.ok) return setStatus({ kind: "problem", message: local.reason });

    setStatus({ kind: "checking" });
    timer.current = setTimeout(async () => {
      try {
        const result = await checkUsername(local.username);
        if (id !== latest.current) return;
        setStatus(result.status === "available" ? { kind: "available" } : { kind: "problem", message: result.message });
      } catch {
        if (id === latest.current) setStatus({ kind: "problem", message: "Couldn't check right now. Try again." });
      }
    }, CHECK_DELAY_MS);
  }

  useEffect(() => () => clearTimeout(timer.current), []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSubmitted(value);
    setSubmitting(true);
    try {
      // On success the action redirects, and this component goes away.
      const result = await claimUsername(form);
      setState(result ?? {});
    } catch {
      setState({ error: "Couldn't save right now. Try again." });
    }
    setSubmitting(false);
  }

  const claimError = state.error && value === submitted ? state.error : "";
  const message = claimError || (status.kind === "problem" ? status.message : "");

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Pick your username</h1>
      <p className="mt-1 text-sm text-neutral-500">It becomes the link to your resume.</p>

      <form onSubmit={onSubmit} className="mt-6 grid gap-4">
        <input type="hidden" name="next" value={next} />
        <div className="grid gap-1.5">
          <Label htmlFor="username">Username</Label>
          <div className="flex h-10 items-center rounded-md border border-input bg-background text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
            <span className="select-none whitespace-nowrap pl-3 text-neutral-400">{linkPrefix}</span>
            <input
              id="username"
              name="username"
              value={value}
              onChange={(event) => {
                const typed = normalizeUsername(event.target.value).replace(/\s+/g, "-");
                setValue(typed);
                scheduleCheck(typed);
              }}
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              maxLength={USERNAME_MAX}
              required
              disabled={submitting}
              aria-invalid={message ? true : undefined}
              aria-describedby="username-status"
              className="h-full min-w-0 flex-1 bg-transparent pr-2 outline-none disabled:opacity-50"
            />
            <span className="pr-3" aria-hidden>
              {status.kind === "checking" && <Loader2 className="h-4 w-4 animate-spin text-neutral-400 motion-reduce:animate-none" />}
              {status.kind === "available" && !claimError && <Check className="h-4 w-4 text-emerald-600" />}
              {message && <X className="h-4 w-4 text-amber-600" />}
            </span>
          </div>
          <p id="username-status" aria-live="polite" className={message ? "text-xs text-amber-700" : "text-xs text-neutral-500"}>
            {message ||
              (status.kind === "available" && "Available.") ||
              (status.kind === "checking" && "Checking…") ||
              "Letters, numbers and hyphens."}
          </p>
        </div>

        <Button type="submit" className="w-full" disabled={submitting || status.kind !== "available" || claimError !== ""}>
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden />}
          Continue
        </Button>
      </form>
    </div>
  );
}

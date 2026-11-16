"use client";

import { AlertTriangle, Check, Download, Loader2 } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import { deleteAccount, updateName, updateUsername, type SettingsResult } from "@/app/settings/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { normalizeUsername, USERNAME_MAX } from "@/lib/username";

function Card({ title, description, children, tone }: { title: string; description: string; children: ReactNode; tone?: "danger" }) {
  return (
    <section
      className={`rounded-xl border bg-white p-6 ${tone === "danger" ? "border-red-200" : "border-neutral-200"}`}
    >
      <h2 className={`text-base font-semibold ${tone === "danger" ? "text-red-700" : "text-neutral-900"}`}>{title}</h2>
      <p className="mt-1 text-sm text-neutral-500">{description}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** One text field with a Save button, an inline error and a "Saved" tick. */
function FieldForm({
  id,
  label,
  initial,
  prefix,
  maxLength,
  transform = (v) => v,
  save,
  autoComplete,
}: {
  id: string;
  label: string;
  initial: string;
  prefix?: string;
  maxLength: number;
  transform?: (value: string) => string;
  save: (value: string) => Promise<SettingsResult>;
  autoComplete?: string;
}) {
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setDone(false);
    try {
      const result = await save(value);
      if (result.ok) {
        setSaved(value);
        setDone(true);
      } else setError(result.error);
    } catch {
      setError("Couldn't save right now. Try again.");
    }
    setPending(false);
  }

  return (
    <form onSubmit={submit} className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex gap-2">
        <div className="flex h-10 min-w-0 flex-1 items-center rounded-md border border-input bg-background text-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
          {prefix && <span className="select-none whitespace-nowrap pl-3 text-neutral-400">{prefix}</span>}
          <input
            id={id}
            value={value}
            onChange={(event) => {
              setValue(transform(event.target.value));
              setDone(false);
            }}
            maxLength={maxLength}
            autoComplete={autoComplete}
            disabled={pending}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            className={`h-full min-w-0 flex-1 bg-transparent pr-3 outline-none ${prefix ? "" : "pl-3"}`}
          />
        </div>
        <Button type="submit" disabled={pending || value.trim() === "" || value === saved}>
          {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden />}
          Save
        </Button>
      </div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs text-amber-700">
          {error}
        </p>
      ) : done ? (
        <p role="status" className="flex items-center gap-1 text-xs text-emerald-700">
          <Check className="h-3.5 w-3.5" aria-hidden /> Saved
        </p>
      ) : null}
    </form>
  );
}

export function ProfileSettings({ name, email }: { name: string; email: string }) {
  return (
    <Card title="Profile" description="Your name as it appears in your account. Your resumes have their own name field.">
      <div className="grid gap-4">
        <FieldForm id="name" label="Name" initial={name} maxLength={100} save={updateName} autoComplete="name" />
        <div className="grid gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={email} readOnly disabled />
        </div>
      </div>
    </Card>
  );
}

export function UsernameSettings({ username, linkPrefix }: { username: string; linkPrefix: string }) {
  return (
    <Card
      title="Username"
      description="Your public links use it. Changing it changes every link, and the old ones stop working."
    >
      <FieldForm
        id="username"
        label="Username"
        initial={username}
        prefix={linkPrefix}
        maxLength={USERNAME_MAX}
        transform={(v) => normalizeUsername(v).replace(/\s+/g, "-")}
        save={updateUsername}
        autoComplete="username"
      />
    </Card>
  );
}

export function ExportSettings() {
  return (
    <Card title="Export your data" description="Download everything we store about you as a JSON file: your account and all your resumes.">
      <Button variant="outline" asChild>
        <a href="/api/account/export" download>
          <Download className="mr-2 h-4 w-4" aria-hidden />
          Download my data
        </a>
      </Button>
    </Card>
  );
}

export function DeleteAccount({ username }: { username: string }) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function confirm() {
    setPending(true);
    setError("");
    try {
      // On success the action redirects to the home page.
      const result = await deleteAccount(typed);
      if (result && !result.ok) setError(result.error);
    } catch {
      setError("Couldn't delete your account right now. Try again.");
    }
    setPending(false);
  }

  return (
    <Card
      tone="danger"
      title="Delete account"
      description="Deletes your account, every resume, uploaded file and public link. This can't be undone."
    >
      <Button variant="destructive" onClick={() => setOpen(true)}>
        Delete my account
      </Button>
      <Dialog open={open} onOpenChange={(next) => !pending && setOpen(next)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" aria-hidden />
              Delete your account?
            </DialogTitle>
            <DialogDescription>
              Everything goes: resumes, files and links. Download your data first if you want a copy. Type{" "}
              <strong className="text-neutral-900">{username}</strong> to confirm.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            aria-label="Type your username to confirm"
            autoComplete="off"
            disabled={pending}
          />
          {error && (
            <p role="alert" className="text-sm text-amber-700">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirm}
              disabled={pending || typed.trim().toLowerCase() !== username}
            >
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden />}
              Delete forever
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

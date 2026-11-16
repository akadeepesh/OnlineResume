"use client";

import { Loader2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useSyncExternalStore } from "react";
import { importResume } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { parseResumeDraft } from "@/lib/resume/draft";
import { sampleResume } from "@/lib/resume/sample";
import type { Resume } from "@/lib/resume/schema";
import { EDITOR_STORAGE_KEY } from "@/lib/store/keys";

// ============================================================================
// "You have a draft in this browser": offers to save the guest editor's draft
// to the account. Shown only for drafts with real content (not the untouched
// example or an empty page). Dismissing hides it for that exact draft.
// ============================================================================

const DISMISSED_KEY = `${EDITOR_STORAGE_KEY}:import-dismissed`;

/** Short fingerprint of the draft, so dismissing applies to this draft only. */
function fingerprint(text: string): string {
  let hash = 5381;
  for (let i = 0; i < text.length; i++) hash = ((hash << 5) + hash + text.charCodeAt(i)) | 0;
  return `${text.length}:${hash}`;
}

const read = (key: string) => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null; // storage blocked
  }
};

const subscribe = (onChange: () => void) => {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
};

const hasContent = (resume: Resume) =>
  resume.profile.name.trim() !== "" ||
  Boolean(resume.about?.trim()) ||
  resume.experience.length + resume.projects.length + resume.education.length + resume.skills.length > 0;

/** Comparable form of a resume, after defaults and migrations are applied. */
const normalized = (resume: unknown) => JSON.stringify(parseResumeDraft(resume));
const sampleJson = normalized(sampleResume);

export default function GuestDraftImport() {
  const router = useRouter();
  const raw = useSyncExternalStore(subscribe, () => read(EDITOR_STORAGE_KEY), () => null);
  const dismissed = useSyncExternalStore(subscribe, () => read(DISMISSED_KEY), () => null);
  const [hidden, setHidden] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const draft = useMemo(() => {
    if (!raw) return null;
    try {
      const envelope = JSON.parse(raw) as { state?: { resume?: unknown; template?: unknown } };
      const parsed = parseResumeDraft(envelope.state?.resume);
      if (!parsed.success || !hasContent(parsed.data)) return null;
      if (normalized(parsed.data) === sampleJson) return null; // untouched example
      return { resume: parsed.data, template: envelope.state?.template, id: fingerprint(raw) };
    } catch {
      return null;
    }
  }, [raw]);

  if (!draft || hidden || dismissed === draft.id) return null;

  async function save() {
    if (!draft) return;
    setPending(true);
    setError("");
    try {
      const result = await importResume(draft.resume, draft.template);
      if (!result.ok) {
        setError(result.error);
        setPending(false);
        return;
      }
      // It lives in the account now; the guest editor starts fresh.
      try {
        window.localStorage.removeItem(EDITOR_STORAGE_KEY);
      } catch {
        // storage blocked: nothing to clean up
      }
      setHidden(true);
      if (result.id) router.push(`/editor/${result.id}`);
    } catch {
      setError("Couldn't save right now. Try again.");
      setPending(false);
    }
  }

  function dismiss() {
    try {
      window.localStorage.setItem(DISMISSED_KEY, draft!.id);
    } catch {
      // storage blocked: hide for this visit only
    }
    setHidden(true);
  }

  const name = draft.resume.profile.name.trim();
  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <Upload className="h-5 w-5 flex-shrink-0 text-blue-600" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-neutral-900">You have a resume draft in this browser</p>
          <p className="text-sm text-neutral-600">
            {name ? `"${name}"` : "Your draft"} was written without an account. Save it to keep it everywhere.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={dismiss} disabled={pending}>
            Not now
          </Button>
          <Button size="sm" onClick={save} disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden />}
            Save to my account
          </Button>
        </div>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-amber-800">
          {error}
        </p>
      )}
    </div>
  );
}

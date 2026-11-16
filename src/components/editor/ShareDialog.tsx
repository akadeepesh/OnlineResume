"use client";

import { Check, Copy, ExternalLink, Globe, Lock, Share2 } from "lucide-react";
import { useState } from "react";
import { updateSharing } from "@/app/editor/[id]/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface ShareSettings {
  /** Full public URL of this resume. */
  url: string;
  isPublished: boolean;
  noindex: boolean;
}

function Switch({
  checked,
  onChange,
  disabled,
  labelledBy,
  describedBy,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  labelledBy: string;
  describedBy: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50",
        checked ? "bg-emerald-600" : "bg-neutral-300",
      )}
    >
      <span
        className={cn(
          "inline-block h-5 w-5 rounded-full bg-white shadow transition-transform motion-reduce:transition-none",
          checked ? "translate-x-5" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

/** "Share" in the editor: the link, publish switch and search-engine switch. */
export default function ShareDialog({ resumeId, initial }: { resumeId: string; initial: ShareSettings }) {
  const [settings, setSettings] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function change(patch: Partial<Pick<ShareSettings, "isPublished" | "noindex">>) {
    const before = settings;
    setSettings({ ...settings, ...patch }); // optimistic
    setSaving(true);
    setError("");
    try {
      const result = await updateSharing(resumeId, patch);
      if (result.ok) setSettings((s) => ({ ...s, ...result.sharing }));
      else {
        setSettings(before);
        setError(result.error);
      }
    } catch {
      setSettings(before);
      setError("Couldn't save that change. Try again.");
    }
    setSaving(false);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(settings.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Couldn't copy. Select the link and copy it yourself.");
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant={settings.isPublished ? "outline" : "default"} className="gap-1.5">
          <Share2 className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">Share</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share your resume</DialogTitle>
          <DialogDescription>
            {settings.isPublished
              ? "Anyone with the link can see it. Changes show up as soon as they're saved."
              : "It's private: only you can open the link. Publish it when you're ready."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 rounded-md border border-neutral-200 bg-neutral-50 p-1 pl-3">
          {settings.isPublished ? (
            <Globe className="h-4 w-4 flex-shrink-0 text-emerald-600" aria-hidden />
          ) : (
            <Lock className="h-4 w-4 flex-shrink-0 text-neutral-400" aria-hidden />
          )}
          <input
            readOnly
            value={settings.url}
            aria-label="Public link"
            onFocus={(event) => event.currentTarget.select()}
            className="min-w-0 flex-1 bg-transparent text-sm text-neutral-700 outline-none"
          />
          <Button size="sm" variant="ghost" onClick={copy} aria-label="Copy link">
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
          </Button>
          <Button size="sm" variant="ghost" asChild>
            <a href={settings.url} target="_blank" rel="noopener noreferrer" aria-label="Open link in a new tab">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>

        <div className="grid gap-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p id="share-published" className="text-sm font-medium text-neutral-900">
                Published
              </p>
              <p id="share-published-hint" className="text-xs text-neutral-500">
                Off: the link shows "not found" to everyone but you.
              </p>
            </div>
            <Switch
              checked={settings.isPublished}
              onChange={(isPublished) => change({ isPublished })}
              disabled={saving}
              labelledBy="share-published"
              describedBy="share-published-hint"
            />
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p id="share-search" className="text-sm font-medium text-neutral-900">
                Show in search engines
              </p>
              <p id="share-search-hint" className="text-xs text-neutral-500">
                Off by default. On lets Google and others list your page.
              </p>
            </div>
            <Switch
              checked={!settings.noindex}
              onChange={(visible) => change({ noindex: !visible })}
              disabled={saving || !settings.isPublished}
              labelledBy="share-search"
              describedBy="share-search-hint"
            />
          </div>
        </div>

        {error && (
          <p role="alert" className="text-sm text-amber-700">
            {error}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

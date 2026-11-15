"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { Avatar } from "@/components/shared/Avatar";
import { Button } from "@/components/ui/button";
import { has } from "@/lib/resume/view";
import { AVATAR_ACCEPT, AvatarError, avatarFromFile } from "@/lib/editor/avatar";

/** Photo picker: resizes in the browser, shows initials when there's no photo. */
export function AvatarField({
  value,
  name,
  onChange,
}: {
  value?: string;
  name: string;
  onChange: (avatar: string | undefined) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      onChange(await avatarFromFile(file));
    } catch (e) {
      setError(e instanceof AvatarError ? e.message : "Something went wrong reading that image.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = ""; // allow picking the same file again
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Avatar
        src={value}
        name={name.trim() || "?"}
        size={72}
        className="h-[72px] w-[72px] rounded-full object-cover ring-1 ring-black/10"
      />
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-neutral-800">
          Photo <span className="ml-1 font-normal text-neutral-400">optional</span>
        </span>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
            {has(value) ? "Change photo" : "Add photo"}
          </Button>
          {has(value) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-1.5 text-neutral-500"
              onClick={() => onChange(undefined)}
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </Button>
          )}
        </div>
        <p className={error ? "text-xs text-amber-700" : "text-xs text-neutral-500"} role={error ? "status" : undefined}>
          {error ?? "A clear, friendly headshot. Without one we show your initials."}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={AVATAR_ACCEPT}
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(e) => pick(e.target.files?.[0])}
        />
      </div>
    </div>
  );
}

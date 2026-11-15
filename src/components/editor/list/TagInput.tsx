"use client";

import { useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { parseTags } from "@/lib/editor/list-ops";
import type { FieldControlProps } from "@/components/editor/fields/Field";

/**
 * Chips for short lists like skills. Enter or comma adds, Backspace on an
 * empty input removes the last chip, and pasting "React, Node, SQL" adds all
 * three. Whatever is typed is added when the field loses focus, so nothing is
 * lost if someone just clicks away.
 */
export function TagInput({
  value,
  onChange,
  placeholder,
  control,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  control: FieldControlProps;
}) {
  const [draft, setDraft] = useState("");
  const tags = value.filter((t) => t.trim());

  const commit = (text: string) => {
    const added = parseTags(text, tags);
    if (added.length) onChange([...tags, ...added]);
    setDraft("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && !e.nativeEvent.isComposing) {
      e.preventDefault();
      commit(draft);
    } else if (e.key === "Backspace" && draft === "" && tags.length > 0) {
      e.preventDefault();
      onChange(tags.slice(0, -1));
    }
  };

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text/plain");
    if (!/[,;\n]/.test(text)) return;
    e.preventDefault();
    commit(draft + text);
  };

  return (
    <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-2 py-1.5 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
      {tags.map((tag, i) => (
        <span
          key={`${tag}-${i}`}
          className="flex items-center gap-1 rounded bg-neutral-100 py-0.5 pl-2 pr-1 text-sm text-neutral-800"
        >
          {tag}
          <button
            type="button"
            onClick={() => onChange(tags.filter((_, j) => j !== i))}
            aria-label={`Remove ${tag}`}
            className="rounded p-0.5 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-700"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        {...control}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        onBlur={() => draft.trim() && commit(draft)}
        placeholder={tags.length === 0 ? placeholder : "Add another…"}
        className="min-w-[8rem] flex-1 bg-transparent px-1 py-1 text-sm outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}

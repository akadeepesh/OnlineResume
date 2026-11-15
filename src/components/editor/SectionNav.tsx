"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/lib/store/editor";
import { isSectionFilled, isSectionId, sections, type SectionId } from "@/lib/editor/sections";

type Props = { active: SectionId; onSelect: (id: SectionId) => void };

function useFilled() {
  const resume = useEditorStore((s) => s.resume);
  return (id: SectionId) => isSectionFilled(resume, id);
}

/** Desktop sidebar: every section with a tick once it has content. */
export function SectionSidebar({ active, onSelect }: Props) {
  const filled = useFilled();
  const done = sections.filter((s) => filled(s.id)).length;

  return (
    <nav aria-label="Resume sections" className="flex h-full flex-col gap-1 p-3">
      <p className="px-2 pb-2 text-xs font-medium text-neutral-500">
        {done} of {sections.length} filled in
      </p>
      {sections.map(({ id, label }) => {
        const isDone = filled(id);
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            aria-current={active === id ? "step" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm text-neutral-600 transition-colors hover:bg-neutral-100",
              active === id && "bg-neutral-100 font-medium text-neutral-900",
            )}
          >
            <span
              className={cn(
                "flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border",
                isDone ? "border-emerald-600 bg-emerald-600 text-white" : "border-neutral-300",
              )}
              aria-hidden
            >
              {isDone && <Check className="h-3 w-3" strokeWidth={3} />}
            </span>
            {label}
            <span className="sr-only">{isDone ? "(filled in)" : "(empty)"}</span>
          </button>
        );
      })}
    </nav>
  );
}

/** Mobile: the same list as a native select, which phones handle well. */
export function SectionSelect({ active, onSelect }: Props) {
  const filled = useFilled();
  return (
    <label className="block">
      <span className="sr-only">Section</span>
      <select
        value={active}
        onChange={(e) => isSectionId(e.target.value) && onSelect(e.target.value)}
        className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm"
      >
        {sections.map(({ id, label }) => (
          <option key={id} value={id}>
            {filled(id) ? "✓ " : "○ "}
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}

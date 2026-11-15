"use client";

import { useId, useRef, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import { SkillIcon } from "@/components/shared/SkillIcon";
import type { IconKey } from "@/lib/resume/schema";

const LABELS: Record<IconKey, string> = {
  code: "Code",
  globe: "Web",
  cpu: "Systems",
  database: "Data",
  brain: "AI / ML",
  folder: "Project",
  file: "Document",
  trophy: "Award",
};

/**
 * Shown in LABELS order, so related icons sit together (the schema's order is
 * arbitrary). LABELS is a Record<IconKey, …>, so TypeScript guarantees every
 * icon the schema allows is listed.
 */
const ICONS = Object.keys(LABELS) as IconKey[];

/**
 * A row of icons to choose from. It's a radio group: Tab moves into it once,
 * and the arrow keys change the choice, like native radio buttons.
 */
export function IconPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: IconKey;
  onChange: (icon: IconKey) => void;
}) {
  const labelId = useId();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: KeyboardEvent, index: number) => {
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (index + step + ICONS.length) % ICONS.length;
    onChange(ICONS[next]);
    buttons.current[next]?.focus();
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span id={labelId} className="text-sm font-medium text-neutral-800">
        {label}
      </span>
      <div role="radiogroup" aria-labelledby={labelId} className="flex flex-wrap gap-1.5">
        {ICONS.map((icon, index) => {
          const selected = icon === value;
          return (
            <button
              key={icon}
              ref={(el) => {
                buttons.current[index] = el;
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={LABELS[icon]}
              title={LABELS[icon]}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(icon)}
              onKeyDown={(e) => onKeyDown(e, index)}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-md border text-neutral-500 transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selected ? "border-neutral-900 bg-neutral-900 text-white hover:bg-neutral-800" : "border-neutral-200",
              )}
            >
              <SkillIcon name={icon} className="h-4 w-4" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

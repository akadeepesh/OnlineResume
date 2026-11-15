"use client";

import { useId, type ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FieldControlProps {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
}

/**
 * Label, hint and warning around one form control. The control is passed as
 * a render function so it gets the right id and aria attributes.
 */
export function Field({
  label,
  hint,
  warning,
  optional,
  counter,
  className,
  children,
}: {
  label: string;
  hint?: ReactNode;
  /** A gentle "this looks off" message. Never blocks saving. */
  warning?: string | null;
  optional?: boolean;
  /** Shown at the right of the label row, e.g. a character count. */
  counter?: ReactNode;
  className?: string;
  children: (control: FieldControlProps) => ReactNode;
}) {
  const id = useId();
  const hintId = `${id}-hint`;
  const warningId = `${id}-warning`;
  // The warning replaces the hint, so only point at the one that's rendered.
  const describedBy = warning ? warningId : hint ? hintId : undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium text-neutral-800">
          {label}
          {optional && <span className="ml-1.5 font-normal text-neutral-400">optional</span>}
        </label>
        {counter}
      </div>
      {children({ id, "aria-describedby": describedBy, "aria-invalid": warning ? true : undefined })}
      {warning ? (
        <p id={warningId} className="flex items-start gap-1.5 text-xs text-amber-700" role="status">
          <AlertCircle className="mt-px h-3.5 w-3.5 flex-shrink-0" aria-hidden />
          {warning}
        </p>
      ) : (
        hint && (
          <p id={hintId} className="text-xs text-neutral-500">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

/** "42 / 120" that turns amber past the soft limit. Never blocks typing. */
export function CharCount({ value, soft }: { value: string; soft: number }) {
  const n = value.length;
  return (
    <span className={cn("text-xs tabular-nums text-neutral-400", n > soft && "text-amber-700")}>
      {n} / {soft}
    </span>
  );
}

"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Field } from "./Field";
import { looksLikeLink, normalizeLink } from "@/lib/editor/fields";

/**
 * A link input: accepts "trailmark.app" and turns it into
 * "https://trailmark.app" when the field loses focus. Warns about typos only
 * after the field has been left, and never blocks saving.
 */
export function LinkField({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value?: string;
  onChange: (next: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  const [left, setLeft] = useState(false);
  const current = value ?? "";
  const warning = left && current.trim() && !looksLikeLink(current) ? "That doesn't look like a link. Check for typos." : null;

  return (
    <Field label={label} optional hint={hint} warning={warning}>
      {(control) => (
        <Input
          {...control}
          type="text"
          inputMode="url"
          autoComplete="url"
          spellCheck={false}
          value={current}
          onChange={(e) => onChange(e.target.value)}
          onBlur={(e) => {
            const tidy = normalizeLink(e.target.value);
            if (tidy !== e.target.value) onChange(tidy);
            setLeft(true);
          }}
          placeholder={placeholder}
        />
      )}
    </Field>
  );
}

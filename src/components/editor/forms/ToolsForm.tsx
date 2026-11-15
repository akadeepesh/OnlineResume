"use client";

import { Input } from "@/components/ui/input";
import { Field } from "@/components/editor/fields/Field";
import { ItemListEditor } from "@/components/editor/list/ItemListEditor";
import { TagInput } from "@/components/editor/list/TagInput";
import { has, itemHasContent } from "@/lib/resume/view";

export default function ToolsForm() {
  return (
    <ItemListEditor
      section="tools"
      noun="group"
      addLabel="Add a group"
      emptyHint="No tools yet. Group them by kind, like Frontend, Backend or Design."
      summarize={(t) => ({ title: t.name, subtitle: t.skills.filter(has).join(", ") })}
      renderFields={({ item, update }) => (
        <>
          <Field
            label="Group name"
            hint="e.g. Frontend, Cloud & hosting, Design"
            warning={
              !has(item.name) && itemHasContent({ ...item, name: "" })
                ? "Name this group so the tools have a heading."
                : null
            }
          >
            {(control) => (
              <Input
                {...control}
                value={item.name}
                onChange={(e) => update({ name: e.target.value })}
                placeholder="Frontend"
              />
            )}
          </Field>
          <Field label="Tools" hint="Press Enter or a comma after each one. Paste a list to add them all.">
            {(control) => (
              <TagInput
                control={control}
                value={item.skills}
                onChange={(skills) => update({ skills })}
                placeholder="React, Tailwind, Vite"
              />
            )}
          </Field>
        </>
      )}
    />
  );
}

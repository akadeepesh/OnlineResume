"use client";

import { Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/editor/fields/Field";
import { IconPicker } from "@/components/editor/fields/IconPicker";
import { ItemListEditor } from "@/components/editor/list/ItemListEditor";

export default function SkillsForm() {
  return (
    <ItemListEditor
      section="skills"
      noun="skill"
      addLabel="Add a skill"
      emptyHint="No skills yet. Add the handful you'd most like to be hired for."
      summarize={(s) => ({ title: s.name })}
      renderFields={({ item, update }) => {
        const linked = item.repos.length + (item.sites?.length ?? 0);
        return (
          <>
            <Field label="Skill" hint="e.g. TypeScript, Product design, Data analysis">
              {(control) => (
                <Input
                  {...control}
                  value={item.name}
                  onChange={(e) => update({ name: e.target.value })}
                  placeholder="TypeScript"
                />
              )}
            </Field>
            <IconPicker label="Icon" value={item.icon} onChange={(icon) => update({ icon })} />
            {linked > 0 && (
              // Linked repos/sites can't be edited here yet; they're kept as they are.
              <p className="flex items-start gap-2 text-xs text-neutral-500">
                <Info className="mt-px h-3.5 w-3.5 flex-shrink-0" aria-hidden />
                Linked to {linked} {linked === 1 ? "piece" : "pieces"} of work. Those links are kept as they
                are.
              </p>
            )}
          </>
        );
      }}
    />
  );
}

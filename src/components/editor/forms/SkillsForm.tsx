"use client";

import { Link2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/editor/fields/Field";
import { IconPicker } from "@/components/editor/fields/IconPicker";
import { ItemListEditor } from "@/components/editor/list/ItemListEditor";
import { workForSkill } from "@/lib/resume/view";
import { useEditorStore } from "@/lib/store/editor";

/** "Linked to 2 projects": projects that list this skill in their technologies. */
function LinkedProjects({ name }: { name: string }) {
  const count = useEditorStore((s) => workForSkill(s.resume, { name }).length);
  if (!name.trim()) return null;
  return (
    <p className="flex items-start gap-2 text-xs text-neutral-500">
      <Link2 className="mt-px h-3.5 w-3.5 flex-shrink-0" aria-hidden />
      {count > 0
        ? `Linked to ${count} ${count === 1 ? "project" : "projects"} that list "${name.trim()}" in their technologies.`
        : `Add "${name.trim()}" to a project's technologies to link it here.`}
    </p>
  );
}

export default function SkillsForm() {
  return (
    <ItemListEditor
      section="skills"
      noun="skill"
      addLabel="Add a skill"
      emptyHint="No skills yet. Add the handful you'd most like to be hired for."
      summarize={(s) => ({ title: s.name })}
      renderFields={({ item, update }) => (
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
          <LinkedProjects name={item.name} />
        </>
      )}
    />
  );
}

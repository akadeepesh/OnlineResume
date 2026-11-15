"use client";

import { Input } from "@/components/ui/input";
import { Field } from "@/components/editor/fields/Field";
import { BulletEditor } from "@/components/editor/list/BulletEditor";
import { ItemListEditor } from "@/components/editor/list/ItemListEditor";
import { TagInput } from "@/components/editor/list/TagInput";
import { has, itemHasContent, joinParts } from "@/lib/resume/view";

export default function ExperienceForm() {
  return (
    <ItemListEditor
      section="experience"
      noun="role"
      addLabel="Add a role"
      emptyHint="No roles yet. Add your most recent job first; internships and freelance work count too."
      summarize={(e) => ({ title: e.title, subtitle: joinParts([e.company, e.date]) })}
      renderFields={({ item, update }) => (
        <>
          <Field
            label="Job title"
            hint="e.g. Senior Software Engineer"
            warning={
              !has(item.title) && itemHasContent({ ...item, title: "" })
                ? "Add a job title so this role reads properly."
                : null
            }
          >
            {(control) => (
              <Input
                {...control}
                value={item.title}
                onChange={(e) => update({ title: e.target.value })}
                placeholder="Software Engineer"
                autoComplete="organization-title"
              />
            )}
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Company" optional>
              {(control) => (
                <Input
                  {...control}
                  value={item.company ?? ""}
                  onChange={(e) => update({ company: e.target.value })}
                  placeholder="Northwind Labs"
                  autoComplete="organization"
                />
              )}
            </Field>
            <Field label="Location" optional>
              {(control) => (
                <Input
                  {...control}
                  value={item.location ?? ""}
                  onChange={(e) => update({ location: e.target.value })}
                  placeholder="Remote"
                />
              )}
            </Field>
          </div>

          <Field label="Dates" optional hint="Any format. Just keep it the same for every role.">
            {(control) => (
              <Input
                {...control}
                value={item.date ?? ""}
                onChange={(e) => update({ date: e.target.value })}
                placeholder="Mar 2023 – Present"
              />
            )}
          </Field>

          <Field
            label="What you did"
            optional
            hint="3–5 bullets. Start with a verb and add a number where you can. Paste a list to split it into bullets."
          >
            {(_control, { labelId }) => (
              <BulletEditor
                value={item.responsibilities}
                onChange={(responsibilities) => update({ responsibilities })}
                placeholder="Led the redesign of the checkout, raising conversion by **12%**."
                labelledBy={labelId}
              />
            )}
          </Field>

          <Field label="Skills used" optional hint="Press Enter or a comma after each one.">
            {(control) => (
              <TagInput
                control={control}
                value={item.skills}
                onChange={(skills) => update({ skills })}
                placeholder="React, TypeScript, AWS"
              />
            )}
          </Field>
        </>
      )}
    />
  );
}

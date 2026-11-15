"use client";

import { Input } from "@/components/ui/input";
import { CharCount, Field } from "@/components/editor/fields/Field";
import { LinkField } from "@/components/editor/fields/LinkField";
import { BulletEditor } from "@/components/editor/list/BulletEditor";
import { ItemListEditor } from "@/components/editor/list/ItemListEditor";
import { TagInput } from "@/components/editor/list/TagInput";
import { displayUrl, has, itemHasContent, joinParts } from "@/lib/resume/view";

const DESCRIPTION_SOFT_LIMIT = 160;

export default function ProjectsForm() {
  return (
    <ItemListEditor
      section="projects"
      noun="project"
      addLabel="Add a project"
      emptyHint="No projects yet. Side projects, open source and notable work projects all count."
      summarize={(p) => ({
        title: p.name,
        subtitle: joinParts([p.description, has(p.demo) ? displayUrl(p.demo.trim()) : undefined]),
      })}
      renderFields={({ item, update }) => (
        <>
          <Field
            label="Project name"
            warning={
              !has(item.name) && itemHasContent({ ...item, name: "" })
                ? "Add a name so this project reads properly."
                : null
            }
          >
            {(control) => (
              <Input
                {...control}
                value={item.name}
                onChange={(e) => update({ name: e.target.value })}
                placeholder="Trailmark"
              />
            )}
          </Field>

          <Field
            label="Short description"
            optional
            hint="One line: what it is and who it's for."
            counter={<CharCount value={item.description ?? ""} soft={DESCRIPTION_SOFT_LIMIT} />}
          >
            {(control) => (
              <Input
                {...control}
                value={item.description ?? ""}
                onChange={(e) => update({ description: e.target.value })}
                placeholder="An open-source habit tracker with streaks and offline sync."
              />
            )}
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <LinkField
              label="Live link"
              value={item.demo}
              onChange={(demo) => update({ demo })}
              placeholder="trailmark.app"
            />
            <LinkField
              label="Source code"
              value={item.github}
              onChange={(github) => update({ github })}
              placeholder="github.com/you/trailmark"
            />
          </div>

          <Field
            label="Highlights"
            optional
            hint="What you built and what came of it: users, speed, stars, lessons."
          >
            {(_control, { labelId }) => (
              <BulletEditor
                value={item.details}
                onChange={(details) => update({ details })}
                placeholder="Offline-first PWA that syncs across devices; **2k+** weekly users."
                addLabel="Add highlight"
                labelledBy={labelId}
              />
            )}
          </Field>

          <Field label="Built with" optional hint="Press Enter or a comma after each one.">
            {(control) => (
              <TagInput
                control={control}
                value={item.technologies}
                onChange={(technologies) => update({ technologies })}
                placeholder="Next.js, PostgreSQL, Tailwind"
              />
            )}
          </Field>
        </>
      )}
    />
  );
}

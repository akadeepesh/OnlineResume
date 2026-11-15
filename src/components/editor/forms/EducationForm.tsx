"use client";

import { Input } from "@/components/ui/input";
import { Field } from "@/components/editor/fields/Field";
import { ItemListEditor } from "@/components/editor/list/ItemListEditor";
import { has, itemHasContent, joinParts } from "@/lib/resume/view";

export default function EducationForm() {
  return (
    <ItemListEditor
      section="education"
      noun="school"
      addLabel="Add education"
      emptyHint="No education yet. Add degrees, bootcamps or long courses, most recent first."
      summarize={(e) => ({ title: e.institution, subtitle: joinParts([e.degree, e.period]) })}
      renderFields={({ item, update }) => (
        <>
          <Field
            label="School"
            hint="University, college, bootcamp or online program."
            warning={
              !has(item.institution) && itemHasContent({ ...item, institution: "" })
                ? "Add the school's name so this entry reads properly."
                : null
            }
          >
            {(control) => (
              <Input
                {...control}
                value={item.institution}
                onChange={(e) => update({ institution: e.target.value })}
                placeholder="Westbrook University"
              />
            )}
          </Field>

          <Field label="Degree or program" optional>
            {(control) => (
              <Input
                {...control}
                value={item.degree ?? ""}
                onChange={(e) => update({ degree: e.target.value })}
                placeholder="B.S. Computer Science"
              />
            )}
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Dates" optional>
              {(control) => (
                <Input
                  {...control}
                  value={item.period ?? ""}
                  onChange={(e) => update({ period: e.target.value })}
                  placeholder="2015 – 2019"
                />
              )}
            </Field>
            <Field label="Location" optional>
              {(control) => (
                <Input
                  {...control}
                  value={item.location ?? ""}
                  onChange={(e) => update({ location: e.target.value })}
                  placeholder="Portland, OR"
                />
              )}
            </Field>
          </div>
        </>
      )}
    />
  );
}

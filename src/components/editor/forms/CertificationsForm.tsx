"use client";

import { Input } from "@/components/ui/input";
import { Field } from "@/components/editor/fields/Field";
import { IconPicker } from "@/components/editor/fields/IconPicker";
import { LinkField } from "@/components/editor/fields/LinkField";
import { ItemListEditor } from "@/components/editor/list/ItemListEditor";
import { has, itemHasContent, joinParts } from "@/lib/resume/view";

export default function CertificationsForm() {
  return (
    <ItemListEditor
      section="certifications"
      noun="certificate"
      addLabel="Add a certificate"
      emptyHint="No certificates yet. Add certifications, awards or courses you've completed."
      summarize={(c) => ({ title: c.name, subtitle: joinParts([c.issuer, c.date]) })}
      renderFields={({ item, update }) => (
        <>
          <Field
            label="Name"
            hint="e.g. AWS Certified Developer – Associate"
            warning={
              !has(item.name) && itemHasContent({ ...item, name: "" })
                ? "Add the certificate's name so this entry reads properly."
                : null
            }
          >
            {(control) => (
              <Input
                {...control}
                value={item.name}
                onChange={(e) => update({ name: e.target.value })}
                placeholder="Professional Scrum Master I"
              />
            )}
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Issued by" optional>
              {(control) => (
                <Input
                  {...control}
                  value={item.issuer ?? ""}
                  onChange={(e) => update({ issuer: e.target.value })}
                  placeholder="Scrum.org"
                />
              )}
            </Field>
            <Field label="Date" optional>
              {(control) => (
                <Input
                  {...control}
                  value={item.date ?? ""}
                  onChange={(e) => update({ date: e.target.value })}
                  placeholder="Jun 2024"
                />
              )}
            </Field>
          </div>

          <LinkField
            label="Link"
            value={item.link}
            onChange={(link) => update({ link })}
            placeholder="credly.com/badges/…"
            hint="A link to the certificate, so people can check it."
          />

          <Field label="Note" optional hint="One line, e.g. what it covers or your score.">
            {(control) => (
              <Input
                {...control}
                value={item.description ?? ""}
                onChange={(e) => update({ description: e.target.value })}
                placeholder="Agile delivery, sprint planning and team facilitation."
              />
            )}
          </Field>

          <IconPicker label="Icon" value={item.icon} onChange={(icon) => update({ icon })} />
        </>
      )}
    />
  );
}

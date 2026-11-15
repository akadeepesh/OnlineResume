"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { CharCount, Field } from "@/components/editor/fields/Field";
import { AvatarField } from "@/components/editor/fields/AvatarField";
import { useEditorStore } from "@/lib/store/editor";
import { looksLikeEmail, looksLikeLink, normalizeSocial } from "@/lib/editor/fields";
import type { SocialKind } from "@/lib/resume/view";

const TAGLINE_SOFT_LIMIT = 120;

const SOCIAL_FIELDS: { kind: SocialKind; label: string; placeholder: string; hint: string }[] = [
  {
    kind: "email",
    label: "Email",
    placeholder: "alex@example.com",
    hint: "Use one you check. Recruiters will write to it.",
  },
  {
    kind: "linkedin",
    label: "LinkedIn",
    placeholder: "alex-morgan or a full link",
    hint: "Your profile name or link. We'll make it a full link.",
  },
  {
    kind: "github",
    label: "GitHub",
    placeholder: "alexmorgan or a full link",
    hint: "Your username or link. Skip it if it isn't relevant to the job.",
  },
];

export default function ProfileForm() {
  const profile = useEditorStore((s) => s.resume.profile);
  const updateProfile = useEditorStore((s) => s.updateProfile);
  const updateSocials = useEditorStore((s) => s.updateSocials);
  // Hints about mistakes only appear after someone leaves a field, not mid-typing.
  const [left, setLeft] = useState<Set<string>>(new Set());
  const markLeft = (key: string) => setLeft((prev) => (prev.has(key) ? prev : new Set(prev).add(key)));

  const socialWarning = (kind: SocialKind): string | null => {
    const value = profile.socials[kind] ?? "";
    if (!left.has(kind) || !value.trim()) return null;
    if (kind === "email") return looksLikeEmail(value) ? null : "That doesn't look like an email address yet.";
    return looksLikeLink(value) ? null : "That doesn't look like a link. Check for typos.";
  };

  return (
    <div className="flex flex-col gap-6">
      <AvatarField
        value={profile.avatar}
        name={profile.name}
        onChange={(avatar) => updateProfile({ avatar })}
      />

      <Field
        label="Full name"
        hint="The name you want on your resume."
        warning={left.has("name") && !profile.name.trim() ? "Add your name. It's the one field every resume needs." : null}
      >
        {(control) => (
          <Input
            {...control}
            value={profile.name}
            onChange={(e) => updateProfile({ name: e.target.value })}
            onBlur={() => markLeft("name")}
            placeholder="Alex Morgan"
            autoComplete="name"
          />
        )}
      </Field>

      <Field label="Role" optional hint="The job you want next, e.g. Frontend Developer or Product Designer.">
        {(control) => (
          <Input
            {...control}
            value={profile.role ?? ""}
            onChange={(e) => updateProfile({ role: e.target.value })}
            placeholder="Full Stack Developer"
            autoComplete="organization-title"
          />
        )}
      </Field>

      <Field
        label="Tagline"
        optional
        hint="One line under your name: what you do and for whom."
        counter={<CharCount value={profile.tagline ?? ""} soft={TAGLINE_SOFT_LIMIT} />}
      >
        {(control) => (
          <Input
            {...control}
            value={profile.tagline ?? ""}
            onChange={(e) => updateProfile({ tagline: e.target.value })}
            placeholder="Building fast, accessible web products with TypeScript."
          />
        )}
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Location" optional hint="City and country, or Remote.">
          {(control) => (
            <Input
              {...control}
              value={profile.location ?? ""}
              onChange={(e) => updateProfile({ location: e.target.value })}
              placeholder="Portland, OR"
              autoComplete="address-level2"
            />
          )}
        </Field>
        <Field label="Availability" optional hint="A small status badge. Leave blank to hide it.">
          {(control) => (
            <Input
              {...control}
              value={profile.availability ?? ""}
              onChange={(e) => updateProfile({ availability: e.target.value })}
              placeholder="Open to new opportunities"
            />
          )}
        </Field>
      </div>

      <fieldset className="flex flex-col gap-6 border-t border-neutral-100 pt-6">
        <legend className="mb-1 text-sm font-semibold text-neutral-900">How to reach you</legend>
        {SOCIAL_FIELDS.map(({ kind, label, placeholder, hint }) => (
          <Field key={kind} label={label} optional hint={hint} warning={socialWarning(kind)}>
            {(control) => (
              <Input
                {...control}
                type={kind === "email" ? "email" : "text"}
                inputMode={kind === "email" ? "email" : "url"}
                autoComplete={kind === "email" ? "email" : "url"}
                spellCheck={false}
                value={profile.socials[kind] ?? ""}
                onChange={(e) => updateSocials({ [kind]: e.target.value })}
                onBlur={(e) => {
                  const tidy = normalizeSocial(kind, e.target.value);
                  if (tidy !== e.target.value) updateSocials({ [kind]: tidy });
                  markLeft(kind);
                }}
                placeholder={placeholder}
              />
            )}
          </Field>
        ))}
      </fieldset>
    </div>
  );
}

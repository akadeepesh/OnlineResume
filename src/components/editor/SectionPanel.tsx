"use client";

import { useEffect, useRef, type ComponentType } from "react";
import { ArrowLeft, ArrowRight, EyeOff, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { editorOrder, isSectionHidden, neighbours, sectionMeta, type SectionId } from "@/lib/editor/sections";
import { useEditorStore } from "@/lib/store/editor";
import AboutForm from "./forms/AboutForm";
import CertificationsForm from "./forms/CertificationsForm";
import EducationForm from "./forms/EducationForm";
import ExperienceForm from "./forms/ExperienceForm";
import ProfileForm from "./forms/ProfileForm";
import ProjectsForm from "./forms/ProjectsForm";
import SkillsForm from "./forms/SkillsForm";
import ToolsForm from "./forms/ToolsForm";

/** The form for each section. */
const forms: Record<SectionId, ComponentType> = {
  profile: ProfileForm,
  about: AboutForm,
  experience: ExperienceForm,
  education: EducationForm,
  projects: ProjectsForm,
  skills: SkillsForm,
  tools: ToolsForm,
  certifications: CertificationsForm,
};

type Props = { active: SectionId; onSelect: (id: SectionId) => void };

/** One section of the editor: heading, tip, its form, and Back/Next buttons. */
export default function SectionPanel({ active, onSelect }: Props) {
  const section = sectionMeta(active);
  // Back/Next walk the resume top to bottom, in the order the person chose.
  const sectionOrder = useEditorStore((s) => s.resume.sectionOrder);
  const { prev, next } = neighbours(section.id, editorOrder({ sectionOrder }));
  const hidden = useEditorStore((s) => isSectionHidden(s.resume, section.id));
  const setSectionHidden = useEditorStore((s) => s.setSectionHidden);
  const Form = forms[section.id];
  const rootRef = useRef<HTMLDivElement>(null);

  // Moving to another section starts at the top of the form. Compare with the
  // previous section rather than skipping the first render: React's dev Strict
  // Mode runs effects twice, which would make a "first render" flag misfire.
  const previous = useRef(section.id);
  useEffect(() => {
    if (previous.current === section.id) return;
    previous.current = section.id;
    const scroller = rootRef.current?.closest("[data-editor-scroll]");
    if (scroller) scroller.scrollTop = 0;
  }, [section.id]);

  return (
    <div ref={rootRef} className="mx-auto flex w-full max-w-xl flex-col gap-6 px-5 py-6 sm:px-8 sm:py-8">
      <header>
        <h1 className="text-xl font-semibold text-neutral-900">{section.label}</h1>
        <p className="mt-1 text-sm text-neutral-500">{section.description}</p>
      </header>

      {hidden && section.id !== "profile" && (
        <div
          className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-700"
          role="status"
        >
          <EyeOff className="h-4 w-4 flex-shrink-0 text-neutral-500" aria-hidden />
          <span className="flex-1">Hidden from your resume. What you write here is kept.</span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8"
            onClick={() => section.id !== "profile" && setSectionHidden(section.id, false)}
          >
            Show it
          </Button>
        </div>
      )}

      <p className="flex gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
        <Lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden />
        <span>{section.tip}</span>
      </p>

      <Form />

      <footer className="flex items-center justify-between border-t border-neutral-100 pt-4">
        {prev ? (
          <Button variant="ghost" size="sm" onClick={() => onSelect(prev.id)} className="gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            {prev.label}
          </Button>
        ) : (
          <span />
        )}
        {next && (
          <Button size="sm" onClick={() => onSelect(next.id)} className="gap-1.5">
            {next.label}
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </footer>
    </div>
  );
}

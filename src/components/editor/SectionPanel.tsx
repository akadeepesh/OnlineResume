"use client";

import { ArrowLeft, ArrowRight, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { neighbours, sections, type SectionId } from "@/lib/editor/sections";

type Props = { active: SectionId; onSelect: (id: SectionId) => void };

/**
 * One section of the form, with a tip and Back/Next buttons. The actual
 * fields arrive section by section in the next PRs.
 */
export default function SectionPanel({ active, onSelect }: Props) {
  const section = sections.find((s) => s.id === active) ?? sections[0];
  const { prev, next } = neighbours(section.id);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 px-5 py-6 sm:px-8 sm:py-8">
      <header>
        <h1 className="text-xl font-semibold text-neutral-900">{section.label}</h1>
        <p className="mt-1 text-sm text-neutral-500">{section.description}</p>
      </header>

      <p className="flex gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
        <Lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden />
        <span>{section.tip}</span>
      </p>

      <div className="rounded-lg border border-dashed border-neutral-300 px-4 py-10 text-center text-sm text-neutral-500">
        {`The ${section.label.toLowerCase()} form is coming soon. For now, try the templates and “Start over”. The preview updates live.`}
      </div>

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

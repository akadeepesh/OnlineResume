"use client";

import { Check, ChevronDown } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEditorStore } from "@/lib/store/editor";
import { templateMeta } from "@/templates/meta";

function Swatch({ colors }: { colors: readonly string[] }) {
  return (
    <span className="flex h-5 w-5 flex-shrink-0 overflow-hidden rounded ring-1 ring-black/10">
      {colors.map((color) => (
        <span key={color} className="flex-1" style={{ background: color }} />
      ))}
    </span>
  );
}

export default function TemplatePicker() {
  const template = useEditorStore((s) => s.template);
  const setTemplate = useEditorStore((s) => s.setTemplate);
  const active = templateMeta.find((t) => t.slug === template) ?? templateMeta[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-2")}
        aria-label={`Template: ${active.name}`}
      >
        <Swatch colors={active.swatch} />
        <span className="hidden sm:inline">{active.name}</span>
        <ChevronDown className="h-3.5 w-3.5 text-neutral-500" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="text-xs uppercase tracking-wider text-neutral-400">
          Template
        </DropdownMenuLabel>
        {templateMeta.map((t) => (
          <DropdownMenuItem
            key={t.slug}
            onSelect={() => setTemplate(t.slug)}
            className="gap-3 py-2"
          >
            <Swatch colors={t.swatch} />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">{t.name}</span>
              <span className="block truncate text-xs text-neutral-500">{t.description}</span>
            </span>
            {t.slug === template && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

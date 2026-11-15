"use client";

import { useState } from "react";
import { ChevronDown, FilePlus2, Sparkles } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { editorStore } from "@/lib/store/editor";

const choices = {
  example: {
    label: "Start from the example",
    hint: "A filled-in sample you can edit",
    icon: Sparkles,
    confirm: "Replace your resume with the example?",
    run: () => editorStore.getState().resetToExample(),
  },
  blank: {
    label: "Start blank",
    hint: "An empty resume",
    icon: FilePlus2,
    confirm: "Clear your resume and start blank?",
    run: () => editorStore.getState().startBlank(),
  },
} as const;

type Choice = keyof typeof choices;

/** "Start from" menu. Always asks first, because it replaces the whole draft. */
export default function StartFromMenu() {
  const [pending, setPending] = useState<Choice | null>(null);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1")}>
          Start over
          <ChevronDown className="h-3.5 w-3.5 text-neutral-500" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          {(Object.keys(choices) as Choice[]).map((key) => {
            const { label, hint, icon: Icon } = choices[key];
            return (
              <DropdownMenuItem key={key} onSelect={() => setPending(key)} className="gap-3 py-2">
                <Icon className="h-4 w-4 text-neutral-500" />
                <span>
                  <span className="block text-sm">{label}</span>
                  <span className="block text-xs text-neutral-500">{hint}</span>
                </span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={pending !== null} onOpenChange={(open) => !open && setPending(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{pending && choices[pending].confirm}</DialogTitle>
            <DialogDescription>
              Everything you&apos;ve written in this browser will be replaced. This can&apos;t be
              undone yet.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setPending(null)}>
              Keep my resume
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (pending) choices[pending].run();
                setPending(null);
              }}
            >
              Replace it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

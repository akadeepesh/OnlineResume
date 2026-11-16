"use client";

import { ArrowLeft, Printer } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

/**
 * Shown above the printable resume, never on paper. With `autoPrint`, opens
 * the print dialog once fonts are loaded (otherwise the PDF can use fallback
 * fonts).
 */
export default function PrintToolbar({ backHref, autoPrint }: { backHref: string; autoPrint: boolean }) {
  useEffect(() => {
    if (!autoPrint) return;
    let cancelled = false;
    void document.fonts.ready.then(() => {
      if (!cancelled) window.print();
    });
    return () => {
      cancelled = true;
    };
  }, [autoPrint]);

  return (
    <div className="sticky top-0 z-10 border-b border-neutral-200 bg-neutral-50/95 backdrop-blur print:hidden">
      <div className="mx-auto flex max-w-[800px] items-center justify-between gap-3 px-8 py-3">
        <a href={backHref} className="flex items-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-900">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back
        </a>
        <p className="hidden text-xs text-neutral-500 sm:block">Choose “Save as PDF” as the printer.</p>
        <Button size="sm" onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" aria-hidden />
          Save as PDF
        </Button>
      </div>
    </div>
  );
}

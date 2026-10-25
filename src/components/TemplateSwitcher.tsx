"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Palette } from "lucide-react";
import { templateMeta, type TemplateSlug } from "@/templates/meta";

export default function TemplateSwitcher({ current }: { current: TemplateSlug }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = templateMeta.find((t) => t.slug === current);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={ref}
      className="fixed bottom-4 left-4 z-[60] font-sans print:hidden sm:bottom-6 sm:left-6"
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 mb-2 w-72 origin-bottom-left overflow-hidden rounded-2xl border border-black/10 bg-white/95 p-1.5 text-neutral-900 shadow-2xl shadow-black/20 backdrop-blur"
          >
            <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              Templates
            </p>
            {templateMeta.map((t) => (
              <Link
                key={t.slug}
                href={`/templates/${t.slug}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-neutral-100"
              >
                <span className="flex h-8 w-8 flex-shrink-0 overflow-hidden rounded-lg ring-1 ring-black/10">
                  {t.swatch.map((color) => (
                    <span key={color} className="flex-1" style={{ background: color }} />
                  ))}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{t.name}</span>
                  <span className="block truncate text-xs text-neutral-500">
                    {t.description}
                  </span>
                </span>
                {t.slug === current && <Check className="h-4 w-4 text-neutral-900" />}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border border-black/10 bg-white/90 py-2 pl-3 pr-4 text-sm font-medium text-neutral-900 shadow-lg shadow-black/10 backdrop-blur transition-transform hover:scale-[1.03]"
      >
        <Palette className="h-4 w-4" />
        {active?.name ?? "Templates"}
      </button>
    </div>
  );
}

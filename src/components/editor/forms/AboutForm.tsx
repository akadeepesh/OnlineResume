"use client";

import { useRef } from "react";
import { Bold } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CharCount, Field } from "@/components/editor/fields/Field";
import { RichText } from "@/components/shared/RichText";
import { useEditorStore } from "@/lib/store/editor";
import { useBoldShortcut } from "@/components/editor/list/hooks";

const ABOUT_SOFT_LIMIT = 600;

const EXAMPLE =
  "**Frontend developer** with four years of experience building fast, accessible web apps in **React and TypeScript**. I like turning rough ideas into polished features, and I care about performance and clean, tested code.";

export default function AboutForm() {
  const about = useEditorStore((s) => s.resume.about ?? "");
  const setAbout = useEditorStore((s) => s.setAbout);
  const ref = useRef<HTMLTextAreaElement>(null);
  const { bold, handleBoldKey } = useBoldShortcut(ref, about, setAbout);

  return (
    <div className="flex flex-col gap-6">
      <Field
        label="Summary"
        optional
        hint={
          <>
            Two to four sentences. Select words and press <kbd className="rounded border px-1">Ctrl</kbd>+
            <kbd className="rounded border px-1">B</kbd> (or the B button) to make them <strong>bold</strong>.
          </>
        }
        counter={<CharCount value={about} soft={ABOUT_SOFT_LIMIT} />}
      >
        {(control) => (
          <div className="rounded-md border border-input focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
            <div className="flex items-center gap-1 border-b border-neutral-100 px-1.5 py-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                // Keep the textarea's selection when the button is pressed.
                onMouseDown={(e) => e.preventDefault()}
                onClick={bold}
                aria-label="Bold (Ctrl+B)"
                title="Bold (Ctrl+B)"
              >
                <Bold className="h-4 w-4" />
              </Button>
            </div>
            <Textarea
              {...control}
              ref={ref}
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              onKeyDown={handleBoldKey}
              rows={8}
              placeholder="What you do, what you're good at, and what you're looking for."
              className="resize-y border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        )}
      </Field>

      <details className="group rounded-lg border border-neutral-200 px-4 py-3 text-sm">
        <summary className="cursor-pointer select-none font-medium text-neutral-700">
          Need a starting point? See an example
        </summary>
        <p className="mt-3 leading-relaxed text-neutral-600">
          <RichText text={EXAMPLE} />
        </p>
        {!about.trim() && (
          <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => setAbout(EXAMPLE)}>
            Use this and edit it
          </Button>
        )}
      </details>
    </div>
  );
}

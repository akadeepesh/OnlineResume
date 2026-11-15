"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Eye, PencilLine } from "lucide-react";
import { Group, Panel, Separator } from "react-resizable-panels";
import { cn } from "@/lib/utils";
import { useEditorHydration, useEditorStore } from "@/lib/store/editor";
import type { SectionId } from "@/lib/editor/sections";
import PreviewPane from "./PreviewPane";
import SectionPanel from "./SectionPanel";
import { SectionSelect, SectionSidebar } from "./SectionNav";
import StartFromMenu from "./StartFromMenu";
import TemplatePicker from "./TemplatePicker";

const DESKTOP_QUERY = "(min-width: 1024px)";

function useIsDesktop(): boolean | null {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(DESKTOP_QUERY);
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => null, // unknown on the server
  );
}

function SaveStatus() {
  return (
    <span
      className="hidden items-center gap-1 text-xs text-neutral-500 md:flex"
      title="Your resume is saved in this browser as you type. Sign-in to keep it everywhere is coming soon."
    >
      <Check className="h-3.5 w-3.5 text-emerald-600" />
      Saved in this browser
    </span>
  );
}

function TopBar() {
  // Before hydration the store still holds the example, so don't flash its name.
  const name = useEditorStore((s) => (s.hasHydrated ? s.resume.profile.name.trim() : null));
  return (
    <header className="flex h-14 flex-shrink-0 items-center gap-3 border-b border-neutral-200 bg-white px-3 sm:px-4">
      <Link
        href="/"
        className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
        aria-label="Back to home"
      >
        <ArrowLeft className="h-4 w-4" />
      </Link>
      <p className="min-w-0 flex-1 truncate text-sm font-medium text-neutral-900">
        {name === null ? "" : name || "Untitled resume"}
      </p>
      <SaveStatus />
      <TemplatePicker />
      <StartFromMenu />
    </header>
  );
}

function Loading() {
  return (
    <div className="flex flex-1 items-center justify-center text-sm text-neutral-500" role="status">
      Loading your resume…
    </div>
  );
}

function DesktopLayout({ section, onSelect }: { section: SectionId; onSelect: (id: SectionId) => void }) {
  // The preview iframe would swallow pointer events mid-drag, so it's made
  // non-interactive while the split handle is held.
  const [dragging, setDragging] = useState(false);
  useEffect(() => {
    if (!dragging) return;
    const stop = () => setDragging(false);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    return () => {
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
  }, [dragging]);

  return (
    <div className="flex min-h-0 flex-1">
      <aside className="w-52 flex-shrink-0 overflow-y-auto border-r border-neutral-200 bg-white">
        <SectionSidebar active={section} onSelect={onSelect} />
      </aside>
      <Group orientation="horizontal" className="min-w-0 flex-1">
        <Panel id="form" defaultSize="45%" minSize="30%" className="overflow-y-auto bg-white">
          <SectionPanel active={section} onSelect={onSelect} />
        </Panel>
        <Separator
          onPointerDown={() => setDragging(true)}
          className="group relative w-1.5 flex-shrink-0 bg-neutral-200 outline-none transition-colors hover:bg-neutral-300 focus-visible:bg-blue-400 data-[separator=active]:bg-blue-400"
          aria-label="Resize the form and preview"
        >
          <span className="absolute left-1/2 top-1/2 h-8 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-400 group-hover:bg-neutral-500" />
        </Separator>
        <Panel id="preview" minSize="30%">
          <PreviewPane interactive={!dragging} />
        </Panel>
      </Group>
    </div>
  );
}

function MobileLayout({ section, onSelect }: { section: SectionId; onSelect: (id: SectionId) => void }) {
  const [view, setView] = useState<"edit" | "preview">("edit");
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-shrink-0 border-b border-neutral-200 bg-white p-2">
        <div className="grid grid-cols-2 rounded-lg bg-neutral-100 p-1" role="tablist">
          {(
            [
              ["edit", "Edit", PencilLine],
              ["preview", "Preview", Eye],
            ] as const
          ).map(([key, label, Icon]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={view === key}
              onClick={() => setView(key)}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-md py-1.5 text-sm text-neutral-500",
                view === key && "bg-white font-medium text-neutral-900 shadow-sm",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>
      {view === "edit" ? (
        <div className="min-h-0 flex-1 overflow-y-auto bg-white">
          <div className="px-5 pt-4">
            <SectionSelect active={section} onSelect={onSelect} />
          </div>
          <SectionPanel active={section} onSelect={onSelect} />
        </div>
      ) : (
        <div className="min-h-0 flex-1">
          <PreviewPane defaultDevice="mobile" />
        </div>
      )}
    </div>
  );
}

export default function EditorShell() {
  const hydrated = useEditorHydration();
  const isDesktop = useIsDesktop();
  const [section, setSection] = useState<SectionId>("profile");

  return (
    <div className="flex h-dvh flex-col bg-neutral-50 font-sans text-neutral-900">
      <TopBar />
      {!hydrated || isDesktop === null ? (
        <Loading />
      ) : isDesktop ? (
        <DesktopLayout section={section} onSelect={setSection} />
      ) : (
        <MobileLayout section={section} onSelect={setSection} />
      )}
    </div>
  );
}

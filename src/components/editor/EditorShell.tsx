"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Check, Eye, Loader2, PencilLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Group, Panel, Separator } from "react-resizable-panels";
import { cn } from "@/lib/utils";
import { useEditorHydration, useEditorStore } from "@/lib/store/editor";
import type { SectionId } from "@/lib/editor/sections";
import { savedLabel } from "@/lib/editor/saved-label";
import { useCloudSave, useCloudSaveState, type CloudSave } from "./cloud-save";
import { HistoryButtons, useHistoryShortcuts } from "./HistoryControls";
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

/** Re-render every 30 s, so "Saved 2 min ago" stays true. */
function useNow(active: boolean): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    // No need to sync first: a `now` older than the save reads as "just now".
    if (!active) return;
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, [active]);
  return now;
}

/**
 * What's actually happened to the draft: waiting to save while you type, saved
 * (and when), or not saved because the browser refused.
 */
function SaveStatus() {
  const available = useEditorStore((s) => s.storageAvailable);
  const pending = useEditorStore((s) => s.savePending);
  const savedAt = useEditorStore((s) => s.lastSavedAt);
  const now = useNow(savedAt !== null);

  if (!available) {
    return (
      <span
        className="flex items-center gap-1 text-xs font-medium text-amber-700"
        role="status"
        title="Your browser blocked saving (private mode, blocked site data, or storage full). Changes are kept until you close this tab."
      >
        <AlertTriangle className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Not saved: browser storage unavailable</span>
        <span className="sm:hidden">Not saved</span>
      </span>
    );
  }

  const label = pending ? "Saving…" : savedAt !== null ? savedLabel(savedAt, now) : "Saved in this browser";
  return (
    <span
      className="flex items-center gap-1 text-xs text-neutral-500"
      title={
        savedAt !== null
          ? `Last saved in this browser at ${new Date(savedAt).toLocaleTimeString()}. Sign in to keep it in your account.`
          : "Your resume is saved in this browser as you type. Sign in to keep it in your account."
      }
    >
      {pending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" aria-hidden />
      ) : (
        <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
      )}
      {/* Phones show just the icon; the words are still read out. */}
      <span className="sr-only md:not-sr-only">{label}</span>
    </span>
  );
}

/** Save status for resumes kept in the account. */
function CloudSaveStatus({ save }: { save: CloudSave }) {
  const state = useCloudSaveState(save);
  const now = useNow(state.kind === "saved" && state.at !== null);

  if (state.kind === "conflict") {
    return (
      <span className="flex items-center gap-2 text-xs font-medium text-amber-700" role="alert">
        <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
        <span className="hidden sm:inline">Changed in another tab</span>
        <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => window.location.reload()}>
          Load theirs
        </Button>
        <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={save.keepMine}>
          Keep mine
        </Button>
      </span>
    );
  }
  if (state.kind === "error") {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-amber-700" role="alert" title={state.message}>
        <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
        <span className="hidden sm:inline">{state.message}</span>
        <span className="sm:hidden">Not saved</span>
      </span>
    );
  }
  const busy = state.kind === "pending" || state.kind === "saving";
  const label = busy ? "Saving…" : state.at !== null ? savedLabel(state.at, now) : "Saved to your account";
  return (
    <span className="flex items-center gap-1 text-xs text-neutral-500" role="status">
      {busy ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" aria-hidden />
      ) : (
        <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
      )}
      <span className="sr-only md:not-sr-only">{label}</span>
    </span>
  );
}

export interface CloudEditorProps {
  save: CloudSave;
  /** The resume's title from the dashboard. */
  title: string;
}

function TopBar({
  onSelect,
  announce,
  cloud,
}: {
  onSelect: (id: SectionId) => void;
  announce: (m: string) => void;
  cloud?: CloudEditorProps;
}) {
  // Before hydration the store still holds the example, so don't flash its name.
  const name = useEditorStore((s) => (s.hasHydrated ? s.resume.profile.name.trim() : null));
  return (
    <header className="flex h-14 flex-shrink-0 items-center gap-3 border-b border-neutral-200 bg-white px-3 sm:px-4">
      <Link
        href={cloud ? "/dashboard" : "/"}
        className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
        aria-label={cloud ? "Back to dashboard" : "Back to home"}
      >
        <ArrowLeft className="h-4 w-4" />
      </Link>
      <p className="min-w-0 flex-1 truncate text-sm font-medium text-neutral-900">
        {cloud ? cloud.title : name === null ? "" : name || "Untitled resume"}
      </p>
      {cloud ? <CloudSaveStatus save={cloud.save} /> : <SaveStatus />}
      <HistoryButtons onSelect={onSelect} announce={announce} />
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
        <Panel id="form" defaultSize="45%" minSize="30%">
          {/* Panel puts extra props on an outer, non-scrolling div, so the
              scroll container (and its marker) is our own element. */}
          <div className="h-full overflow-y-auto bg-white" data-editor-scroll>
            <SectionPanel active={section} onSelect={onSelect} />
          </div>
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
        <div className="min-h-0 flex-1 overflow-y-auto bg-white" data-editor-scroll>
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

function CloudSaveRunner({ save }: { save: CloudSave }) {
  useCloudSave(save);
  return null;
}

/**
 * The editor. Without `cloud` it edits the guest draft in this browser; with
 * it, a resume from the account (inside an `EditorStoreProvider`).
 */
export default function EditorShell({ cloud }: { cloud?: CloudEditorProps } = {}) {
  const hydrated = useEditorHydration();
  const isDesktop = useIsDesktop();
  const [section, setSection] = useState<SectionId>("profile");
  // Undo can change a section you can't see; screen readers hear what happened.
  const [announcement, setAnnouncement] = useState("");
  const announce = useCallback((message: string) => setAnnouncement(message), []);
  useHistoryShortcuts(setSection, announce);

  return (
    <div className="flex h-dvh flex-col bg-neutral-50 font-sans text-neutral-900">
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
      {cloud && <CloudSaveRunner save={cloud.save} />}
      <TopBar onSelect={setSection} announce={announce} cloud={cloud} />
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

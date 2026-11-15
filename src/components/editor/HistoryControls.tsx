"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { Redo2, Undo2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { historyShortcut } from "@/lib/editor/shortcuts";
import { sectionMeta, type SectionId } from "@/lib/editor/sections";
import { editorStore, useEditorStore } from "@/lib/store/editor";

export type HistoryAction = "undo" | "redo";

/**
 * Undo or redo, then show the section the change was in: undoing an edit you
 * can't see would look like nothing happened. Returns a short message for
 * screen readers, or null when there was nothing to do.
 */
export function runHistory(action: HistoryAction, onSelect: (id: SectionId) => void): string | null {
  const state = editorStore.getState();
  const section = action === "undo" ? state.undo() : state.redo();
  if (section === undefined) return null;
  if (section) onSelect(section);
  const verb = action === "undo" ? "Undid" : "Redid";
  return section ? `${verb} a change in ${sectionMeta(section).label}` : `${verb} a change to the section layout`;
}

/**
 * Ctrl/Cmd+Z and Ctrl/Cmd+Shift+Z (or Ctrl+Y) anywhere in the editor, inputs
 * included: the browser's own undo doesn't work on inputs React controls,
 * and ours groups typing the same way. Left alone while a dialog or menu is
 * open, because they act on the resume as it was when they opened (e.g.
 * "Delete this role?" holds the role's position).
 */
export function useHistoryShortcuts(onSelect: (id: SectionId) => void, announce: (message: string) => void) {
  const latest = useRef({ onSelect, announce });
  useEffect(() => {
    latest.current = { onSelect, announce };
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const action = historyShortcut(e);
      if (!action) return;
      if (document.querySelector('[role="dialog"], [role="alertdialog"], [role="menu"]')) return;
      e.preventDefault();
      const message = runHistory(action, latest.current.onSelect);
      if (message) latest.current.announce(message);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}

const noopSubscribe = () => () => {};
/** Apple keyboards show ⌘. Read after hydration, so server and client HTML match. */
const useIsMac = () =>
  useSyncExternalStore(
    noopSubscribe,
    () => /Mac|iPhone|iPad/.test(navigator.platform),
    () => false,
  );

export function HistoryButtons({
  onSelect,
  announce,
}: {
  onSelect: (id: SectionId) => void;
  announce: (message: string) => void;
}) {
  const canUndo = useEditorStore((s) => s.past.length > 0);
  const canRedo = useEditorStore((s) => s.future.length > 0);
  const mac = useIsMac();

  const button = (action: HistoryAction, enabled: boolean, label: string, keys: string, Icon: typeof Undo2) => (
    <button
      type="button"
      onClick={() => {
        const message = runHistory(action, onSelect);
        if (message) announce(message);
      }}
      disabled={!enabled}
      aria-label={label}
      title={`${label} (${keys})`}
      aria-keyshortcuts={action === "undo" ? "Control+Z Meta+Z" : "Control+Shift+Z Meta+Shift+Z Control+Y"}
      className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8 text-neutral-600 disabled:opacity-35")}
    >
      <Icon className="h-4 w-4" />
    </button>
  );

  return (
    <div className="flex items-center">
      {button("undo", canUndo, "Undo", mac ? "⌘Z" : "Ctrl+Z", Undo2)}
      {button("redo", canRedo, "Redo", mac ? "⇧⌘Z" : "Ctrl+Shift+Z", Redo2)}
    </div>
  );
}

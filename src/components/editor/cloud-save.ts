"use client";

import { useEffect } from "react";
import { createStore, useStore, type StoreApi } from "zustand";
import { saveResume, type SaveResult } from "@/app/editor/[id]/actions";
import type { EditorStore } from "@/lib/store/editor";

// ============================================================================
// Autosave for resumes kept in the account.
//
// - Waits for a pause in typing (SAVE_DELAY_MS), then sends the whole resume.
// - One request at a time. Changes made while a save is running are sent
//   right after it, so the last edit always wins.
// - Each save says which version it builds on (`updatedAt`). If another tab
//   or device saved in between, the server refuses and we show a conflict
//   instead of overwriting their work.
// ============================================================================

const SAVE_DELAY_MS = 1000;
/** After a network error, try again after this long. */
const RETRY_MS = 5000;

export type CloudSaveState =
  | { kind: "saved"; at: number | null }
  | { kind: "pending" }
  | { kind: "saving" }
  | { kind: "error"; message: string }
  | { kind: "conflict" };

const MESSAGES: Record<Exclude<Extract<SaveResult, { ok: false }>["reason"], "conflict">, string> = {
  missing: "This resume was deleted.",
  "signed-out": "You were signed out. Sign in again to keep saving.",
  invalid: "Something in this resume couldn't be saved.",
  "too-large": "This resume is too large to save. Try a smaller photo.",
};

export interface CloudSave {
  status: StoreApi<{ state: CloudSaveState }>;
  /** Overwrite the server copy with this one (after a conflict). */
  keepMine: () => void;
  /** Start watching the editor store. Returns a cleanup function. */
  start: () => () => void;
}

export function createCloudSave(store: EditorStore, resumeId: string, initialUpdatedAt: string): CloudSave {
  const status = createStore<{ state: CloudSaveState }>()(() => ({ state: { kind: "saved", at: null } }));
  const setState = (state: CloudSaveState) => status.setState({ state });

  let version: string | null = initialUpdatedAt;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let inFlight = false;
  let dirty = false;
  let stopped = false;

  const save = async () => {
    timer = undefined;
    if (inFlight || stopped) return;
    if (status.getState().state.kind === "conflict" && version !== null) return;
    inFlight = true;
    dirty = false;
    setState({ kind: "saving" });
    const { resume, template } = store.getState();
    let result: SaveResult;
    try {
      result = await saveResume(resumeId, { resume, template }, version);
    } catch {
      inFlight = false;
      dirty = true;
      setState({ kind: "error", message: "Couldn't reach the server. Retrying…" });
      timer = setTimeout(save, RETRY_MS);
      return;
    }
    inFlight = false;
    if (result.ok) {
      version = result.updatedAt;
      if (dirty) return void save();
      setState({ kind: "saved", at: Date.now() });
    } else if (result.reason === "conflict") {
      setState({ kind: "conflict" });
    } else {
      setState({ kind: "error", message: MESSAGES[result.reason] });
    }
  };

  const schedule = () => {
    dirty = true;
    if (status.getState().state.kind === "conflict") return;
    setState({ kind: "pending" });
    clearTimeout(timer);
    timer = setTimeout(save, SAVE_DELAY_MS);
  };

  const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
    const kind = status.getState().state.kind;
    if (kind === "pending" || kind === "saving" || kind === "conflict") event.preventDefault();
  };

  return {
    status,
    keepMine: () => {
      version = null; // overwrite once; the response gives us the new version
      void save();
    },
    start: () => {
      stopped = false;
      const unsubscribe = store.subscribe((state, prev) => {
        if (!state.hasHydrated || !prev.hasHydrated) return;
        if (state.resume !== prev.resume || state.template !== prev.template) schedule();
      });
      const hasWindow = typeof window !== "undefined";
      if (hasWindow) window.addEventListener("beforeunload", warnBeforeLeaving);
      return () => {
        stopped = true;
        unsubscribe();
        clearTimeout(timer);
        if (hasWindow) window.removeEventListener("beforeunload", warnBeforeLeaving);
      };
    },
  };
}

export function useCloudSaveState(save: CloudSave): CloudSaveState {
  return useStore(save.status, (s) => s.state);
}

/** Runs the autosave while the editor is mounted. */
export function useCloudSave(save: CloudSave) {
  useEffect(() => save.start(), [save]);
}

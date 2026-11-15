"use client";

import { useCallback, useLayoutEffect, useRef, useState, type KeyboardEvent, type RefObject } from "react";
import { toggleBold } from "@/lib/editor/bold";
import { insertAt, moveIndex, reconcileByIdentity, reconcileIds, removeAt } from "@/lib/editor/list-ops";

let counter = 0;
const makeId = () => `item-${++counter}`;

export interface StableIdOps {
  /** Insert a new id at `index` (default: the end) and return it. */
  insert: (index?: number) => string;
  remove: (index: number) => void;
  move: (from: number, to: number) => void;
}

interface IdState<T> {
  ids: string[];
  /** The items the ids were last matched to. */
  items: readonly T[];
  revision: number;
}

/**
 * Stable ids for a list whose items have none. Call the matching op in the
 * same event handler as the store action, so both update in one render.
 *
 * When the list changes some other way, the ids are adjusted during render
 * (the pattern React recommends for derived state):
 * - the store's `revision` changed (undo, redo, start over): ids follow the
 *   items by identity, so undoing a drag doesn't swap two cards' ids;
 * - only the length changed: keep what fits, add fresh ids for the rest.
 */
export function useStableIds<T>(items: readonly T[], revision = 0): [string[], StableIdOps] {
  const [state, setState] = useState<IdState<T>>(() => ({
    ids: reconcileIds([], items.length, makeId),
    items,
    revision,
  }));
  let ids = state.ids;
  if (state.items !== items || state.revision !== revision) {
    ids =
      state.revision !== revision
        ? reconcileByIdentity(state.items, state.ids, items, makeId)
        : reconcileIds(state.ids, items.length, makeId);
    setState({ ids, items, revision });
  }

  const update = useCallback(
    (fn: (ids: string[]) => string[]) => setState((prev) => ({ ...prev, ids: fn(prev.ids) })),
    [],
  );
  const insert = useCallback(
    (index?: number) => {
      const id = makeId();
      update((prev) => insertAt(prev, index ?? prev.length, id));
      return id;
    },
    [update],
  );
  const remove = useCallback((index: number) => update((prev) => removeAt(prev, index)), [update]);
  const move = useCallback((from: number, to: number) => update((prev) => moveIndex(prev, from, to)), [update]);

  return [ids, { insert, remove, move }];
}

/**
 * Ctrl/Cmd+B and a B button for a textarea or input holding **bold** text.
 * Keeps the selection on the toggled words after React re-renders.
 */
export function useBoldShortcut(
  ref: RefObject<HTMLTextAreaElement | HTMLInputElement | null>,
  value: string,
  onChange: (next: string) => void,
) {
  const pendingSelection = useRef<[number, number] | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    const sel = pendingSelection.current;
    if (!el || !sel) return;
    pendingSelection.current = null;
    el.focus();
    el.setSelectionRange(sel[0], sel[1]);
  }, [value, ref]);

  const bold = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const edit = toggleBold(el.value, el.selectionStart ?? 0, el.selectionEnd ?? 0);
    pendingSelection.current = [edit.selectionStart, edit.selectionEnd];
    onChange(edit.text);
  }, [ref, onChange]);

  /** Returns true when the key was the bold shortcut (and handled). */
  const handleBoldKey = useCallback(
    (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && e.key.toLowerCase() === "b") {
        e.preventDefault();
        bold();
        return true;
      }
      return false;
    },
    [bold],
  );

  return { bold, handleBoldKey };
}

/** Grow a textarea to fit its text (one row minimum). */
export function useAutosize(ref: RefObject<HTMLTextAreaElement | null>, value: string) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [ref, value]);
}

"use client";

import { useCallback, useLayoutEffect, useRef, type ClipboardEvent, type KeyboardEvent } from "react";
import { Bold, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { insertAt, moveIndex, removeAt, splitPastedBullets } from "@/lib/editor/list-ops";
import { useAutosize, useBoldShortcut, useStableIds } from "./hooks";
import { DragHandle, SortableList, useSortableRow } from "./Sortable";

type Focus = { index: number; caret: number };

/**
 * A list of bullet points that behaves like a text editor: Enter splits,
 * Backspace at the start merges with the previous bullet, pasting several
 * lines makes several bullets, Ctrl/Cmd+B bolds, and rows can be dragged.
 */
export function BulletEditor({
  value,
  onChange,
  placeholder,
  addLabel = "Add bullet",
  labelledBy,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  addLabel?: string;
  /** id of the visible label for the whole list */
  labelledBy?: string;
}) {
  const [ids, idOps] = useStableIds(value.length);
  const inputs = useRef(new Map<string, HTMLTextAreaElement>());
  const pendingFocus = useRef<Focus | null>(null);

  // Focus is moved after React has rendered the new bullets.
  useLayoutEffect(() => {
    const focus = pendingFocus.current;
    if (!focus) return;
    const el = inputs.current.get(ids[focus.index]);
    if (!el) return;
    pendingFocus.current = null;
    el.focus();
    el.setSelectionRange(focus.caret, focus.caret);
  }, [ids, value]);

  const setAt = useCallback(
    (index: number, text: string) => onChange(value.map((v, i) => (i === index ? text : v))),
    [onChange, value],
  );

  const add = () => {
    idOps.insert();
    onChange([...value, ""]);
    pendingFocus.current = { index: value.length, caret: 0 };
  };

  const remove = (index: number) => {
    idOps.remove(index);
    onChange(removeAt(value, index));
    if (value.length > 1) {
      const prev = Math.max(0, index - 1);
      pendingFocus.current = { index: prev, caret: value[prev]?.length ?? 0 };
    }
  };

  const move = (from: number, to: number) => {
    idOps.move(from, to);
    onChange(moveIndex(value, from, to));
  };

  const onKeyDown = (index: number, e: KeyboardEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    const { selectionStart: start, selectionEnd: end } = el;

    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      // Split at the caret: the text after it moves to a new bullet below.
      e.preventDefault();
      const text = value[index];
      idOps.insert(index + 1);
      onChange(insertAt(value.map((v, i) => (i === index ? text.slice(0, start) : v)), index + 1, text.slice(end)));
      pendingFocus.current = { index: index + 1, caret: 0 };
      return;
    }

    if (e.key === "Backspace" && start === 0 && end === 0 && index > 0) {
      // Merge into the previous bullet (or just delete an empty one).
      e.preventDefault();
      const prev = value[index - 1];
      idOps.remove(index);
      onChange(removeAt(value.map((v, i) => (i === index - 1 ? prev + value[index] : v)), index));
      pendingFocus.current = { index: index - 1, caret: prev.length };
      return;
    }

    // Arrow keys at the edges hop between bullets. Those already exist, so
    // focus moves right away; no re-render needed.
    const focusNow = (target: number, caret: number) => {
      const other = inputs.current.get(ids[target]);
      if (!other) return;
      e.preventDefault();
      other.focus();
      other.setSelectionRange(caret, caret);
    };
    if (e.key === "ArrowUp" && start === 0 && end === 0 && index > 0) {
      focusNow(index - 1, value[index - 1].length);
    } else if (e.key === "ArrowDown" && start === el.value.length && index < value.length - 1) {
      focusNow(index + 1, 0);
    }
  };

  const onPaste = (index: number, e: ClipboardEvent<HTMLTextAreaElement>) => {
    const text = e.clipboardData.getData("text/plain");
    if (!/\r?\n/.test(text.trim())) return; // a single line pastes normally
    const lines = splitPastedBullets(text);
    if (lines.length === 0) return;
    e.preventDefault();
    const el = e.currentTarget;
    const before = value[index].slice(0, el.selectionStart);
    const after = value[index].slice(el.selectionEnd);
    const pasted = [...lines];
    pasted[0] = before + pasted[0];
    const caret = pasted[pasted.length - 1].length;
    pasted[pasted.length - 1] += after;
    for (let i = 1; i < pasted.length; i++) idOps.insert(index + i);
    onChange([...value.slice(0, index), ...pasted, ...value.slice(index + 1)]);
    pendingFocus.current = { index: index + pasted.length - 1, caret };
  };

  return (
    <div className="flex flex-col gap-1.5" role="group" aria-labelledby={labelledBy}>
      {value.length > 0 && (
        <SortableList ids={ids} onMove={move}>
          <ul className="flex flex-col gap-1.5">
            {value.map((text, index) => (
              <BulletRow
                key={ids[index]}
                id={ids[index]}
                index={index}
                text={text}
                placeholder={index === 0 ? placeholder : undefined}
                registerInput={(el) => {
                  if (el) inputs.current.set(ids[index], el);
                  else inputs.current.delete(ids[index]);
                }}
                onText={(t) => setAt(index, t)}
                onKeyDown={(e) => onKeyDown(index, e)}
                onPaste={(e) => onPaste(index, e)}
                onRemove={() => remove(index)}
              />
            ))}
          </ul>
        </SortableList>
      )}
      <div>
        <Button type="button" variant="ghost" size="sm" className="h-8 gap-1.5 px-2 text-neutral-600" onClick={add}>
          <Plus className="h-4 w-4" />
          {addLabel}
        </Button>
      </div>
    </div>
  );
}

function BulletRow({
  id,
  index,
  text,
  placeholder,
  registerInput,
  onText,
  onKeyDown,
  onPaste,
  onRemove,
}: {
  id: string;
  index: number;
  text: string;
  placeholder?: string;
  registerInput: (el: HTMLTextAreaElement | null) => void;
  onText: (text: string) => void;
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  onPaste: (e: ClipboardEvent<HTMLTextAreaElement>) => void;
  onRemove: () => void;
}) {
  const { ref, style, handleProps, isDragging } = useSortableRow(id);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const { bold, handleBoldKey } = useBoldShortcut(inputRef, text, onText);
  useAutosize(inputRef, text);

  return (
    <li
      ref={ref}
      style={style}
      className={cn(
        "group flex items-start gap-1 rounded-md bg-white",
        isDragging && "shadow-lg ring-1 ring-neutral-200",
      )}
    >
      <DragHandle label={`Drag bullet ${index + 1} to reorder`} className="mt-1" {...handleProps} />
      <textarea
        ref={(el) => {
          inputRef.current = el;
          registerInput(el);
        }}
        rows={1}
        value={text}
        onChange={(e) => onText(e.target.value)}
        onKeyDown={(e) => {
          if (!handleBoldKey(e)) onKeyDown(e);
        }}
        onPaste={onPaste}
        placeholder={placeholder}
        aria-label={`Bullet ${index + 1}`}
        className="min-h-[40px] flex-1 resize-none overflow-hidden rounded-md border border-input bg-background px-3 py-2 text-sm leading-6 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
      />
      <div className="mt-1 flex opacity-60 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()} // keep the selection in the textarea
          onClick={bold}
          aria-label={`Bold selected text in bullet ${index + 1}`}
          title="Bold (Ctrl+B)"
          className="flex h-8 w-8 items-center justify-center rounded text-neutral-400 hover:bg-neutral-100 hover:text-neutral-800"
        >
          <Bold className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove bullet ${index + 1}`}
          title="Remove"
          className="flex h-8 w-8 items-center justify-center rounded text-neutral-400 hover:bg-neutral-100 hover:text-red-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </li>
  );
}

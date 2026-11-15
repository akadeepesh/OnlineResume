"use client";

import { useState } from "react";
import { ArrowUpDown, Check, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/lib/store/editor";
import {
  editorOrder,
  isSectionFilled,
  isSectionHidden,
  isSectionId,
  sectionMeta,
  type SectionId,
} from "@/lib/editor/sections";
import type { SectionKey } from "@/lib/resume/schema";
import { DragHandle, SortableList, useSortableRow } from "./list/Sortable";

type Props = { active: SectionId; onSelect: (id: SectionId) => void };

/** Everything the nav needs about each section, in the resume's order. */
function useSectionRows() {
  const resume = useEditorStore((s) => s.resume);
  return editorOrder(resume).map((id) => ({
    id,
    label: sectionMeta(id).label,
    filled: isSectionFilled(resume, id),
    hidden: isSectionHidden(resume, id),
  }));
}

type Row = ReturnType<typeof useSectionRows>[number];

function FilledTick({ filled, hidden }: { filled: boolean; hidden: boolean }) {
  return (
    <span
      className={cn(
        "flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border",
        filled ? "border-emerald-600 bg-emerald-600 text-white" : "border-neutral-300",
        hidden && filled && "border-neutral-400 bg-neutral-400",
      )}
      aria-hidden
    >
      {filled && <Check className="h-3 w-3" strokeWidth={3} />}
    </span>
  );
}

function HideToggle({ id, label, hidden }: { id: SectionKey; label: string; hidden: boolean }) {
  const setSectionHidden = useEditorStore((s) => s.setSectionHidden);
  const action = hidden ? `Show ${label} on your resume` : `Hide ${label} from your resume`;
  return (
    <button
      type="button"
      onClick={() => setSectionHidden(id, !hidden)}
      aria-label={action}
      aria-pressed={hidden}
      title={action}
      className={cn(
        "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded text-neutral-400 hover:bg-neutral-200/70 hover:text-neutral-700",
        hidden && "text-neutral-500",
      )}
    >
      {hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
    </button>
  );
}

type Sortable = ReturnType<typeof useSortableRow>;

/** One section in the list: select it, drag it (if `sortable`), hide it. */
function SectionRow({
  row,
  active,
  onSelect,
  sortable,
}: {
  row: Row;
  active: boolean;
  onSelect: (id: SectionId) => void;
  sortable?: Sortable;
}) {
  return (
    <li
      ref={sortable?.ref}
      style={sortable?.style}
      className={cn(
        "group flex items-center gap-0.5 rounded-md pr-0.5 transition-colors hover:bg-neutral-100",
        active && "bg-neutral-100",
        sortable?.isDragging && "bg-white shadow-lg ring-1 ring-neutral-200",
      )}
    >
      {sortable ? (
        <DragHandle label={`Drag ${row.label} to reorder`} className="h-7 w-5" {...sortable.handleProps} />
      ) : (
        <span className="w-5 flex-shrink-0" aria-hidden />
      )}
      <button
        type="button"
        onClick={() => onSelect(row.id)}
        aria-current={active ? "step" : undefined}
        className={cn(
          "flex min-w-0 flex-1 items-center gap-2.5 py-1.5 text-left text-sm text-neutral-600",
          active && "font-medium text-neutral-900",
          row.hidden && "text-neutral-400",
        )}
      >
        <FilledTick filled={row.filled} hidden={row.hidden} />
        <span className={cn("truncate", row.hidden && "line-through decoration-neutral-300")}>{row.label}</span>
        <span className="sr-only">
          {row.filled ? "(filled in)" : "(empty)"}
          {row.hidden && " (hidden from resume)"}
        </span>
      </button>
      {row.id !== "profile" && <HideToggle id={row.id} label={row.label} hidden={row.hidden} />}
    </li>
  );
}

function SortableSectionRow(props: { row: Row; active: boolean; onSelect: (id: SectionId) => void }) {
  return <SectionRow {...props} sortable={useSortableRow(props.row.id)} />;
}

/**
 * The sections as a list you can reorder (drag, or keyboard: focus a handle,
 * Space, arrows, Space) and hide. The profile is the header of every template,
 * so it stays first and always shows.
 */
function SectionList({ active, onSelect }: Props) {
  const rows = useSectionRows();
  const moveSection = useEditorStore((s) => s.moveSection);
  const [profile, ...movable] = rows;

  return (
    <ol className="flex flex-col gap-0.5">
      <SectionRow row={profile} active={active === profile.id} onSelect={onSelect} />
      <SortableList ids={movable.map((r) => r.id)} onMove={moveSection}>
        {movable.map((row) => (
          <SortableSectionRow key={row.id} row={row} active={active === row.id} onSelect={onSelect} />
        ))}
      </SortableList>
    </ol>
  );
}

function FilledCount() {
  const rows = useSectionRows().filter((r) => !r.hidden);
  const done = rows.filter((r) => r.filled).length;
  return (
    <>
      {done} of {rows.length} filled in
    </>
  );
}

/** Desktop sidebar: every section with a tick once it has content. */
export function SectionSidebar({ active, onSelect }: Props) {
  return (
    <nav aria-label="Resume sections" className="flex h-full flex-col gap-1 p-2">
      <p className="px-2 pb-1 pt-1 text-xs font-medium text-neutral-500">
        <FilledCount />
      </p>
      <SectionList active={active} onSelect={onSelect} />
      <p className="mt-auto px-2 pt-4 text-xs leading-relaxed text-neutral-400">
        Drag to reorder your resume. The eye hides a section without deleting it.
      </p>
    </nav>
  );
}

/** Mobile: a native select (phones handle it well) plus a dialog to arrange sections. */
export function SectionSelect({ active, onSelect }: Props) {
  const rows = useSectionRows();
  const [arranging, setArranging] = useState(false);

  return (
    <div className="flex gap-2">
      <label className="block min-w-0 flex-1">
        <span className="sr-only">Section</span>
        <select
          value={active}
          onChange={(e) => isSectionId(e.target.value) && onSelect(e.target.value)}
          className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm"
        >
          {rows.map(({ id, label, filled, hidden }) => (
            <option key={id} value={id}>
              {filled ? "✓ " : "○ "}
              {label}
              {hidden ? " (hidden)" : ""}
            </option>
          ))}
        </select>
      </label>
      <Dialog open={arranging} onOpenChange={setArranging}>
        <DialogTrigger asChild>
          <Button type="button" variant="outline" size="sm" className="h-auto gap-1.5">
            <ArrowUpDown className="h-4 w-4" />
            Arrange
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[92%] sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Arrange sections</DialogTitle>
            <DialogDescription>
              Drag to reorder your resume. The eye hides a section without deleting it.
            </DialogDescription>
          </DialogHeader>
          <SectionList
            active={active}
            onSelect={(id) => {
              onSelect(id);
              setArranging(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

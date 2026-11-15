"use client";

import type { CSSProperties, ReactNode } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type Modifier,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

/** Lists only reorder vertically, so dragged rows don't drift sideways. */
const lockToVerticalAxis: Modifier = ({ transform }) => ({ ...transform, x: 0 });

/** Drag-and-drop (mouse, touch and keyboard) for a vertical list. */
export function SortableList({
  ids,
  onMove,
  children,
}: {
  ids: string[];
  onMove: (from: number, to: number) => void;
  children: ReactNode;
}) {
  const sensors = useSensors(
    // A small distance, so clicks on the handle aren't treated as drags.
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from >= 0 && to >= 0) onMove(from, to);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[lockToVerticalAxis]}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  );
}

/** Wire one row into its SortableList. Spread `handleProps` on the drag handle. */
export function useSortableRow(id: string) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    position: "relative",
    zIndex: isDragging ? 10 : undefined,
  };
  return { ref: setNodeRef, style, handleProps: { ...attributes, ...listeners }, isDragging };
}

export function DragHandle({
  label,
  className,
  ...props
}: { label: string; className?: string } & Record<string, unknown>) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "flex h-8 w-6 flex-shrink-0 cursor-grab touch-none items-center justify-center rounded text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 active:cursor-grabbing",
        className,
      )}
      {...props}
    >
      <GripVertical className="h-4 w-4" />
    </button>
  );
}

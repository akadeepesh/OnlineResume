"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ChevronDown, Copy, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { has, itemHasContent } from "@/lib/resume/view";
import { useEditorStore, type ItemOf, type ListSection } from "@/lib/store/editor";
import { useStableIds } from "./hooks";
import { DragHandle, SortableList, useSortableRow } from "./Sortable";

export interface ItemSummary {
  title?: string;
  subtitle?: string;
}

/**
 * The editor for one list section: a card per item that can be added,
 * opened, duplicated, reordered (drag or menu) and deleted.
 */
export function ItemListEditor<S extends ListSection>({
  section,
  noun,
  addLabel,
  emptyHint,
  summarize,
  renderFields,
}: {
  section: S;
  /** e.g. "role" → "Untitled role", "Delete this role?" */
  noun: string;
  addLabel: string;
  emptyHint: string;
  summarize: (item: ItemOf<S>) => ItemSummary;
  renderFields: (args: { item: ItemOf<S>; update: (patch: Partial<ItemOf<S>>) => void }) => ReactNode;
}) {
  const items = useEditorStore((s) => s.resume[section]) as ItemOf<S>[];
  const addItem = useEditorStore((s) => s.addItem);
  const updateItem = useEditorStore((s) => s.updateItem);
  const removeItem = useEditorStore((s) => s.removeItem);
  const duplicateItem = useEditorStore((s) => s.duplicateItem);
  const moveItem = useEditorStore((s) => s.moveItem);

  const revision = useEditorStore((s) => s.revision);
  const [ids, idOps] = useStableIds(items, revision);
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [confirmIndex, setConfirmIndex] = useState<number | null>(null);
  const cards = useRef(new Map<string, HTMLElement>());
  const focusId = useRef<string | null>(null);

  // After adding or duplicating, bring the new card into view and focus its first field.
  useLayoutEffect(() => {
    const id = focusId.current;
    const card = id ? cards.current.get(id) : undefined;
    if (!card) return;
    focusId.current = null;
    card.scrollIntoView({ block: "nearest" });
    card.querySelector<HTMLElement>("input, textarea")?.focus();
  }, [ids, open]);

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const openAndFocus = (id: string) => {
    setOpen((prev) => new Set(prev).add(id));
    focusId.current = id;
  };

  const add = () => {
    const id = idOps.insert();
    addItem(section);
    openAndFocus(id);
  };
  const duplicate = (index: number) => {
    const id = idOps.insert(index + 1);
    duplicateItem(section, index);
    openAndFocus(id);
  };
  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length || from === to) return;
    idOps.move(from, to);
    moveItem(section, from, to);
  };
  const remove = (index: number) => {
    idOps.remove(index);
    removeItem(section, index);
    setConfirmIndex(null);
  };
  const askRemove = (index: number) =>
    itemHasContent(items[index]) ? setConfirmIndex(index) : remove(index);

  const confirmTitle = confirmIndex !== null ? summarize(items[confirmIndex]).title : undefined;

  return (
    <div className="flex flex-col gap-3">
      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 px-4 py-8 text-center">
          <p className="text-sm text-neutral-500">{emptyHint}</p>
          <Button type="button" size="sm" className="mt-4 gap-1.5" onClick={add}>
            <Plus className="h-4 w-4" />
            {addLabel}
          </Button>
        </div>
      ) : (
        <>
          <SortableList ids={ids} onMove={move}>
            <ol className="flex flex-col gap-3">
              {items.map((item, index) => {
                const id = ids[index];
                return (
                  <ItemCard
                    key={id}
                    id={id}
                    index={index}
                    count={items.length}
                    noun={noun}
                    summary={summarize(item)}
                    open={open.has(id)}
                    registerCard={(el) => {
                      if (el) cards.current.set(id, el);
                      else cards.current.delete(id);
                    }}
                    onToggle={() => toggle(id)}
                    onDuplicate={() => duplicate(index)}
                    onMove={(to) => move(index, to)}
                    onRemove={() => askRemove(index)}
                  >
                    {renderFields({ item, update: (patch) => updateItem(section, index, patch) })}
                  </ItemCard>
                );
              })}
            </ol>
          </SortableList>
          <div>
            <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={add}>
              <Plus className="h-4 w-4" />
              {addLabel}
            </Button>
          </div>
        </>
      )}

      <Dialog open={confirmIndex !== null} onOpenChange={(o) => !o && setConfirmIndex(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this {noun}?</DialogTitle>
            <DialogDescription>
              {has(confirmTitle) ? `"${confirmTitle}" ` : "It "}and everything in it will be removed. You
              can bring it back with Undo.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setConfirmIndex(null)}>
              Keep it
            </Button>
            <Button variant="destructive" onClick={() => confirmIndex !== null && remove(confirmIndex)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ItemCard({
  id,
  index,
  count,
  noun,
  summary,
  open,
  registerCard,
  onToggle,
  onDuplicate,
  onMove,
  onRemove,
  children,
}: {
  id: string;
  index: number;
  count: number;
  noun: string;
  summary: ItemSummary;
  open: boolean;
  registerCard: (el: HTMLElement | null) => void;
  onToggle: () => void;
  onDuplicate: () => void;
  onMove: (to: number) => void;
  onRemove: () => void;
  children: ReactNode;
}) {
  const { ref, style, handleProps, isDragging } = useSortableRow(id);
  const bodyId = `${id}-body`;
  const title = has(summary.title) ? summary.title : `Untitled ${noun}`;

  return (
    <li
      ref={(el) => {
        ref(el);
        registerCard(el);
      }}
      style={style}
      className={cn(
        "rounded-lg border border-neutral-200 bg-white",
        isDragging && "shadow-xl ring-1 ring-neutral-300",
      )}
    >
      <div className="flex items-center gap-1 py-1.5 pl-1.5 pr-1.5">
        <DragHandle label={`Drag ${title} to reorder`} {...handleProps} />
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={bodyId}
          className="flex min-w-0 flex-1 items-center gap-2 rounded px-1.5 py-1 text-left hover:bg-neutral-50"
        >
          <span className="min-w-0 flex-1">
            <span
              className={cn(
                "block truncate text-sm font-medium",
                has(summary.title) ? "text-neutral-900" : "text-neutral-400",
              )}
            >
              {title}
            </span>
            {has(summary.subtitle) && (
              <span className="block truncate text-xs text-neutral-500">{summary.subtitle}</span>
            )}
          </span>
          <ChevronDown
            className={cn("h-4 w-4 flex-shrink-0 text-neutral-400 transition-transform", open && "rotate-180")}
          />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8 text-neutral-500")}
            aria-label={`Actions for ${title}`}
          >
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={onDuplicate} className="gap-2">
              <Copy className="h-4 w-4" /> Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onMove(index - 1)} disabled={index === 0} className="gap-2">
              <ArrowUp className="h-4 w-4" /> Move up
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onMove(index + 1)} disabled={index === count - 1} className="gap-2">
              <ArrowDown className="h-4 w-4" /> Move down
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={onRemove} className="gap-2 text-red-600 focus:text-red-700">
              <Trash2 className="h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {open && (
        <div id={bodyId} className="flex flex-col gap-5 border-t border-neutral-100 px-4 pb-5 pt-4">
          {children}
        </div>
      )}
    </li>
  );
}

/** The parts of a KeyboardEvent the shortcut check needs (easy to test). */
export interface KeyPress {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
}

/**
 * Undo: Ctrl/Cmd+Z. Redo: Ctrl/Cmd+Shift+Z, or Ctrl+Y on Windows. Cmd+Y is
 * left alone: Safari uses it for history.
 */
export function historyShortcut(e: KeyPress): "undo" | "redo" | null {
  if (!(e.ctrlKey || e.metaKey) || e.altKey) return null;
  const key = e.key.toLowerCase();
  if (key === "z") return e.shiftKey ? "redo" : "undo";
  if (key === "y" && e.ctrlKey && !e.metaKey && !e.shiftKey) return "redo";
  return null;
}

import { describe, expect, it } from "vitest";
import { historyShortcut } from "./shortcuts";

const key = (k: string, mods: Partial<Record<"ctrlKey" | "metaKey" | "shiftKey" | "altKey", boolean>> = {}) => ({
  key: k,
  ctrlKey: false,
  metaKey: false,
  shiftKey: false,
  altKey: false,
  ...mods,
});

describe("historyShortcut", () => {
  it("reads Ctrl/Cmd+Z as undo and Ctrl/Cmd+Shift+Z as redo", () => {
    expect(historyShortcut(key("z", { ctrlKey: true }))).toBe("undo");
    expect(historyShortcut(key("z", { metaKey: true }))).toBe("undo");
    // With Shift held, browsers report the key as "Z".
    expect(historyShortcut(key("Z", { ctrlKey: true, shiftKey: true }))).toBe("redo");
    expect(historyShortcut(key("Z", { metaKey: true, shiftKey: true }))).toBe("redo");
  });

  it("also takes Ctrl+Y for redo, as Windows apps do", () => {
    expect(historyShortcut(key("y", { ctrlKey: true }))).toBe("redo");
    expect(historyShortcut(key("y", { metaKey: true }))).toBeNull(); // Cmd+Y is history in Safari
  });

  it("ignores everything else", () => {
    expect(historyShortcut(key("z"))).toBeNull();
    expect(historyShortcut(key("z", { ctrlKey: true, altKey: true }))).toBeNull();
    expect(historyShortcut(key("b", { ctrlKey: true }))).toBeNull();
  });
});

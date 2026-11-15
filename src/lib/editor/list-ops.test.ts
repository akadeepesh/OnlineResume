import { describe, expect, it } from "vitest";
import {
  insertAt,
  mergeBullets,
  moveIndex,
  parseTags,
  reconcileByIdentity,
  reconcileIds,
  removeAt,
  splitBullet,
  splitPastedBullets,
} from "./list-ops";
import { createEditorStore } from "@/lib/store/editor";

describe("moveIndex", () => {
  it("moves and clamps", () => {
    expect(moveIndex(["a", "b", "c"], 0, 2)).toEqual(["b", "c", "a"]);
    expect(moveIndex(["a", "b", "c"], 2, -9)).toEqual(["c", "a", "b"]);
    expect(moveIndex(["a", "b", "c"], 1, 99)).toEqual(["a", "c", "b"]);
    expect(moveIndex(["a"], 5, 0)).toEqual(["a"]);
  });

  it("matches the store's moveItem for every from/to pair", () => {
    // The ids and the store must never disagree about the order.
    const names = ["a", "b", "c", "d"];
    for (let from = 0; from < names.length; from++) {
      for (let to = -1; to <= names.length; to++) {
        const store = createEditorStore({ skipHydration: true });
        store.getState().startBlank();
        for (const name of names) store.getState().addItem("tools", { name });
        store.getState().moveItem("tools", from, to);
        expect(store.getState().resume.tools.map((t) => t.name)).toEqual(moveIndex(names, from, to));
      }
    }
  });
});

describe("insertAt / removeAt", () => {
  it("inserts and removes without mutating", () => {
    const list = ["a", "c"];
    expect(insertAt(list, 1, "b")).toEqual(["a", "b", "c"]);
    expect(removeAt(list, 0)).toEqual(["c"]);
    expect(list).toEqual(["a", "c"]);
  });
});

describe("reconcileIds", () => {
  let n = 0;
  const make = () => `new${++n}`;

  it("keeps ids when the length matches", () => {
    const ids = ["x", "y"];
    expect(reconcileIds(ids, 2, make)).toBe(ids);
  });

  it("trims or extends to the new length", () => {
    expect(reconcileIds(["x", "y", "z"], 1, make)).toEqual(["x"]);
    expect(reconcileIds(["x"], 3, make)).toEqual(["x", "new1", "new2"]);
  });
});

describe("reconcileByIdentity", () => {
  // After undo/redo the list is an older array. Items the user didn't touch
  // are the very same objects, so each keeps its id wherever it moved to.
  let n = 0;
  const make = () => `new${++n}`;
  const a = { name: "a" };
  const b = { name: "b" };
  const c = { name: "c" };

  it("follows items that moved (undoing a drag)", () => {
    expect(reconcileByIdentity([a, b, c], ["1", "2", "3"], [c, a, b], make)).toEqual(["3", "1", "2"]);
  });

  it("gives a restored item a new id and leaves the others alone (undoing a delete)", () => {
    expect(reconcileByIdentity([a, c], ["1", "3"], [a, b, c], make)).toEqual(["1", "new1", "3"]);
  });

  it("keeps the id of an item whose text was reverted in place (undoing typing)", () => {
    const edited = { name: "b, edited" };
    expect(reconcileByIdentity([a, edited], ["1", "2"], [a, b], make)).toEqual(["1", "2"]);
  });

  it("drops ids of items that are gone (undoing an add)", () => {
    expect(reconcileByIdentity([a, b, c], ["1", "2", "3"], [a, c], make)).toEqual(["1", "3"]);
  });

  it("handles equal strings without giving two items the same id", () => {
    const ids = reconcileByIdentity(["x", "x", "y"], ["1", "2", "3"], ["y", "x", "x", "x"], make);
    expect(new Set(ids).size).toBe(4);
    expect(ids[0]).toBe("3");
  });
});

describe("splitPastedBullets", () => {
  it("splits lines and strips bullet markers", () => {
    const pasted = "• Led a team of 4\n- Cut costs by 20%\n* Shipped v2\n1. Hired 3 people\n\n   ● Mentored juniors  ";
    expect(splitPastedBullets(pasted)).toEqual([
      "Led a team of 4",
      "Cut costs by 20%",
      "Shipped v2",
      "Hired 3 people",
      "Mentored juniors",
    ]);
  });

  it("keeps **bold** at the start of a line", () => {
    expect(splitPastedBullets("**Grew** revenue")).toEqual(["**Grew** revenue"]);
  });

  it("keeps hyphens and numbers inside text", () => {
    expect(splitPastedBullets("Built a real-time API\n2024 roadmap")).toEqual(["Built a real-time API", "2024 roadmap"]);
  });
});

describe("parseTags", () => {
  it("splits on commas, semicolons and newlines", () => {
    expect(parseTags("React, Node.js; SQL\nGo")).toEqual(["React", "Node.js", "SQL", "Go"]);
  });

  it("skips blanks and duplicates, including existing tags", () => {
    expect(parseTags("react, , React, Vue", ["vue"])).toEqual(["react"]);
  });
});

describe("splitBullet / mergeBullets", () => {
  it("splits without leaving edge spaces", () => {
    expect(splitBullet("Shipped the API and cut latency", 19, 19)).toEqual(["Shipped the API and", "cut latency"]);
    expect(splitBullet("abc", 3, 3)).toEqual(["abc", ""]);
  });

  it("merges with a space only when needed", () => {
    expect(mergeBullets("shipped it", "on time")).toEqual({ text: "shipped it on time", caret: 11 });
    expect(mergeBullets("shipped it ", "on time")).toEqual({ text: "shipped it on time", caret: 11 });
    expect(mergeBullets("shipped it", "")).toEqual({ text: "shipped it", caret: 10 });
    expect(mergeBullets("", "on time")).toEqual({ text: "on time", caret: 0 });
  });

  it("round-trips a split and merge", () => {
    const text = "Shipped the API and cut latency";
    const [a, b] = splitBullet(text, 15, 15);
    expect(mergeBullets(a, b).text).toBe(text);
  });
});

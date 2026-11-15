import { describe, expect, it } from "vitest";
import { toggleBold } from "./bold";

/** Apply toggleBold to "text with [selection]" and return it in the same notation. */
function run(marked: string): string {
  const start = marked.indexOf("[");
  const end = marked.indexOf("]") - 1;
  const text = marked.replace("[", "").replace("]", "");
  const r = toggleBold(text, start, end);
  return r.text.slice(0, r.selectionStart) + "[" + r.text.slice(r.selectionStart, r.selectionEnd) + "]" + r.text.slice(r.selectionEnd);
}

describe("toggleBold", () => {
  it("wraps the selection", () => {
    expect(run("I like [React] a lot")).toBe("I like **[React]** a lot");
  });

  it("unwraps when the marks are just outside the selection", () => {
    expect(run("I like **[React]** a lot")).toBe("I like [React] a lot");
  });

  it("unwraps when the marks are inside the selection", () => {
    expect(run("I like [**React**] a lot")).toBe("I like [React] a lot");
  });

  it("keeps spaces at the edges outside the marks", () => {
    expect(run("I like[ React ]a lot")).toBe("I like **[React]** a lot");
  });

  it("inserts a selected placeholder when nothing is selected", () => {
    expect(run("Hello []")).toBe("Hello **[bold text]**");
  });

  it("does nothing for a whitespace-only selection", () => {
    expect(run("a[   ]b")).toBe("a[   ]b");
  });

  it("merges bold parts inside the selection into one run", () => {
    expect(run("[use **React** and Node]")).toBe("**[use React and Node]**");
  });

  it("handles a reversed selection", () => {
    expect(toggleBold("abc", 3, 0).text).toBe("**abc**");
  });

  it("round-trips", () => {
    const once = toggleBold("ship fast", 0, 4);
    const twice = toggleBold(once.text, once.selectionStart, once.selectionEnd);
    expect(twice.text).toBe("ship fast");
  });
});

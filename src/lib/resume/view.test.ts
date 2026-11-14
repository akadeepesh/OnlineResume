import { describe, expect, it } from "vitest";
import { displayUrl, firstName, has, initials, joinParts, socialLinks } from "./view";

describe("has", () => {
  it("treats missing and blank strings as absent", () => {
    expect(has(undefined)).toBe(false);
    expect(has(null)).toBe(false);
    expect(has("")).toBe(false);
    expect(has("   ")).toBe(false);
    expect(has("x")).toBe(true);
  });
});

describe("joinParts", () => {
  it("skips missing parts so no separator dangles", () => {
    expect(joinParts(["Acme", undefined, "Remote"])).toBe("Acme · Remote");
    expect(joinParts([undefined, "Remote"])).toBe("Remote");
    expect(joinParts(["", "  "])).toBe("");
    expect(joinParts(["a", "b"], ", ")).toBe("a, b");
  });
});

describe("initials", () => {
  it("uses first and last word", () => {
    expect(initials("Alex Morgan")).toBe("AM");
    expect(initials("Mary Jane Watson")).toBe("MW");
    expect(initials("  cher ")).toBe("C");
  });
});

describe("firstName", () => {
  it("returns the first word", () => {
    expect(firstName(" Alex Morgan")).toBe("Alex");
    expect(firstName("Cher")).toBe("Cher");
  });
});

describe("displayUrl", () => {
  it("strips protocol, www and trailing slash", () => {
    expect(displayUrl("https://www.linkedin.com/in/example/")).toBe("linkedin.com/in/example");
  });
});

describe("socialLinks", () => {
  it("returns only filled-in links, with mailto for email", () => {
    expect(socialLinks({ email: " a@example.com ", github: "" })).toEqual([
      { kind: "email", label: "Email", href: "mailto:a@example.com", display: "a@example.com" },
    ]);
    expect(socialLinks({})).toEqual([]);
    expect(socialLinks(undefined)).toEqual([]);
  });
});

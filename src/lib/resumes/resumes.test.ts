import { describe, expect, it } from "vitest";
import { limitsFor, PLAN_LIMITS } from "@/lib/limits";
import { editedLabel } from "./format";
import { SLUG_MAX, slugify, uniqueSlug } from "./slug";

describe("slugify", () => {
  it("makes a readable slug", () => {
    expect(slugify("Senior Engineer — 2026")).toBe("senior-engineer-2026");
    expect(slugify("  Café   Résumé ")).toBe("cafe-resume");
  });

  it("is never empty and never too long", () => {
    expect(slugify("")).toBe("resume");
    expect(slugify("李雷")).toBe("resume");
    const long = slugify("word ".repeat(30));
    expect(long.length).toBeLessThanOrEqual(SLUG_MAX);
    expect(long.endsWith("-")).toBe(false);
  });
});

describe("uniqueSlug", () => {
  it("adds the first free number", () => {
    expect(uniqueSlug("resume", new Set())).toBe("resume");
    expect(uniqueSlug("resume", new Set(["resume"]))).toBe("resume-2");
    expect(uniqueSlug("resume", new Set(["resume", "resume-2", "resume-3"]))).toBe("resume-4");
  });

  it("stays within the length limit", () => {
    const base = "a".repeat(SLUG_MAX);
    const slug = uniqueSlug(base, new Set([base]));
    expect(slug).toHaveLength(SLUG_MAX);
    expect(slug.endsWith("-2")).toBe(true);
  });
});

describe("editedLabel", () => {
  const now = new Date("2026-11-17T12:00:00Z");
  const ago = (ms: number) => new Date(now.getTime() - ms);

  it("counts up in friendly steps", () => {
    expect(editedLabel(ago(10_000), now)).toBe("just now");
    expect(editedLabel(ago(5 * 60_000), now)).toBe("5 min ago");
    expect(editedLabel(ago(3 * 3_600_000), now)).toBe("3 h ago");
    expect(editedLabel(ago(26 * 3_600_000), now)).toBe("yesterday");
    expect(editedLabel(ago(3 * 86_400_000), now)).toBe("3 days ago");
  });

  it("shows a date after a week, and treats future dates as now", () => {
    expect(editedLabel(new Date("2026-11-01T08:00:00Z"), now)).toBe("1 Nov 2026");
    expect(editedLabel(new Date(now.getTime() + 60_000), now)).toBe("just now");
  });
});

describe("limitsFor", () => {
  it("falls back to the free plan", () => {
    expect(limitsFor("free")).toBe(PLAN_LIMITS.free);
    expect(limitsFor("gone")).toBe(PLAN_LIMITS.free);
    expect(limitsFor(null)).toBe(PLAN_LIMITS.free);
  });
});

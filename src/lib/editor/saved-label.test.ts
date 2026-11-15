import { describe, expect, it } from "vitest";
import { savedLabel } from "./saved-label";

const at = new Date(2026, 10, 15, 14, 5).getTime();
const later = (ms: number) => at + ms;
const MIN = 60_000;

describe("savedLabel", () => {
  it("says just now for the first minute", () => {
    expect(savedLabel(at, later(0))).toBe("Saved just now");
    expect(savedLabel(at, later(59_000))).toBe("Saved just now");
  });

  it("counts minutes for the first hour", () => {
    expect(savedLabel(at, later(MIN))).toBe("Saved 1 min ago");
    expect(savedLabel(at, later(59 * MIN))).toBe("Saved 59 min ago");
  });

  it("shows the time after that", () => {
    expect(savedLabel(at, later(2 * 60 * MIN))).toMatch(/^Saved at \d{1,2}[:.]05/);
  });

  it("tolerates a clock that moved backwards", () => {
    expect(savedLabel(at, later(-5000))).toBe("Saved just now");
  });
});

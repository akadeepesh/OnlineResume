import { describe, expect, it } from "vitest";
import { blankResume, parseResumeDraft } from "./draft";
import { sampleResume } from "./sample";
import { parseResume } from "./schema";

describe("parseResumeDraft", () => {
  it("accepts a blank resume that the strict schema rejects", () => {
    expect(parseResume(blankResume()).success).toBe(false);
    expect(parseResumeDraft(blankResume()).success).toBe(true);
  });

  it("accepts the sample resume unchanged", () => {
    const result = parseResumeDraft(sampleResume);
    expect(result.success && result.data).toEqual(sampleResume);
  });

  it("still rejects wrong types and unknown versions", () => {
    expect(parseResumeDraft({ ...blankResume(), experience: "nope" }).success).toBe(false);
    expect(parseResumeDraft({ ...blankResume(), schemaVersion: 99 }).success).toBe(false);
    expect(parseResumeDraft(null).success).toBe(false);
  });

  it("fills defaults for missing lists", () => {
    const result = parseResumeDraft({ schemaVersion: 2, profile: { name: "" } });
    expect(result.success && result.data.projects).toEqual([]);
  });
});

describe("blankResume", () => {
  it("returns a fresh object each time", () => {
    const a = blankResume();
    a.experience.push({ title: "x", responsibilities: [], skills: [] });
    expect(blankResume().experience).toEqual([]);
  });
});

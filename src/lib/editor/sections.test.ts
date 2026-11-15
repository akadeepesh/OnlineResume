import { describe, expect, it } from "vitest";
import { blankResume } from "@/lib/resume/draft";
import { sampleResume } from "@/lib/resume/sample";
import { isSectionFilled, isSectionId, neighbours, sectionIds, sections } from "./sections";

describe("sections", () => {
  it("has metadata for every id, in order", () => {
    expect(sections.map((s) => s.id)).toEqual([...sectionIds]);
  });

  it("recognises section ids", () => {
    expect(isSectionId("skills")).toBe(true);
    expect(isSectionId("nope")).toBe(false);
  });

  it("finds the previous and next sections", () => {
    expect(neighbours("profile").prev).toBeUndefined();
    expect(neighbours("profile").next?.id).toBe("about");
    expect(neighbours("certifications").next).toBeUndefined();
  });
});

describe("isSectionFilled", () => {
  it("marks every section filled for the sample resume", () => {
    for (const id of sectionIds) expect(isSectionFilled(sampleResume, id)).toBe(true);
  });

  it("marks every section empty for a blank resume", () => {
    for (const id of sectionIds) expect(isSectionFilled(blankResume(), id)).toBe(false);
  });

  it("does not count blank strings or empty items", () => {
    const resume = {
      ...blankResume(),
      profile: { name: "Sam", role: "   ", socials: {} },
      about: "  ",
      experience: [{ title: "", responsibilities: [], skills: [] }],
      tools: [{ name: "Frontend", skills: [""] }],
    };
    expect(isSectionFilled(resume, "profile")).toBe(false);
    expect(isSectionFilled(resume, "about")).toBe(false);
    expect(isSectionFilled(resume, "experience")).toBe(false);
    expect(isSectionFilled(resume, "tools")).toBe(false);
  });
});

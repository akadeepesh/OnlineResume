import { describe, expect, it } from "vitest";
import { blankResume } from "@/lib/resume/draft";
import { sampleResume } from "@/lib/resume/sample";
import { DEFAULT_SECTION_ORDER } from "@/lib/resume/schema";
import { editorOrder, isSectionFilled, isSectionHidden, isSectionId, neighbours, sectionIds, sections } from "./sections";

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

  it("matches the schema's default order", () => {
    expect(sectionIds).toEqual(["profile", ...DEFAULT_SECTION_ORDER]);
  });
});

describe("the editor follows the resume's own order", () => {
  const reordered = {
    ...sampleResume,
    sectionOrder: ["projects", "about", "experience", "education", "skills", "tools", "certifications"] as const,
  };
  const resume = { ...reordered, sectionOrder: [...reordered.sectionOrder], hiddenSections: ["about" as const] };

  it("lists profile first, then the sections in the resume's order", () => {
    expect(editorOrder(resume)).toEqual(["profile", ...resume.sectionOrder]);
  });

  it("finds neighbours in that order, hidden sections included (they can still be edited)", () => {
    const order = editorOrder(resume);
    expect(neighbours("profile", order).next?.id).toBe("projects");
    expect(neighbours("about", order).prev?.id).toBe("projects");
    expect(neighbours("certifications", order).next).toBeUndefined();
  });

  it("knows which sections are hidden; the profile never is", () => {
    expect(isSectionHidden(resume, "about")).toBe(true);
    expect(isSectionHidden(resume, "projects")).toBe(false);
    expect(isSectionHidden(resume, "profile")).toBe(false);
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

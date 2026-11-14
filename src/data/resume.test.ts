import { describe, expect, it } from "vitest";
import { resume } from "./resume";
import { templateMeta } from "@/templates/meta";

describe("sample resume data", () => {
  it("has the core profile fields", () => {
    expect(resume.profile.name).toBeTruthy();
    expect(resume.profile.role).toBeTruthy();
    expect(resume.profile.socials.email).toMatch(/@/);
  });

  it("has every section as an array", () => {
    for (const key of [
      "experience",
      "projects",
      "skills",
      "tools",
      "education",
      "certifications",
    ] as const) {
      expect(Array.isArray(resume[key])).toBe(true);
    }
  });
});

describe("template registry", () => {
  it("has unique template slugs", () => {
    const slugs = templateMeta.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

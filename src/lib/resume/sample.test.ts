import { describe, expect, it } from "vitest";
import { sampleResume } from "./sample";
import { parseResume } from "./schema";
import { templateMeta } from "@/templates/meta";

describe("sample resume", () => {
  it("passes schema validation", () => {
    const result = parseResume(sampleResume);
    if (!result.success) console.error(result.issues);
    expect(result.success).toBe(true);
  });

  it("is clearly fictional (only example.com links and emails)", () => {
    const json = JSON.stringify(sampleResume);
    const hosts = [...json.matchAll(/https?:\/\/([^/"]+)/g)].map((m) => m[1]);
    for (const host of hosts) {
      expect(
        host.endsWith("example.com") ||
          host === "github.com" ||
          host === "www.linkedin.com",
        `unexpected host ${host}`,
      ).toBe(true);
    }
    expect(sampleResume.profile.socials.email.endsWith("@example.com")).toBe(true);
    expect(sampleResume.profile.socials.github).toBe("https://github.com/example");
  });

  it("fills every section so template previews look complete", () => {
    expect(sampleResume.experience.length).toBeGreaterThan(0);
    expect(sampleResume.projects.length).toBeGreaterThan(0);
    expect(sampleResume.skills.length).toBeGreaterThan(0);
    expect(sampleResume.tools.length).toBeGreaterThan(0);
    expect(sampleResume.education.length).toBeGreaterThan(0);
    expect(sampleResume.certifications.length).toBeGreaterThan(0);
  });
});

describe("template registry", () => {
  it("has unique template slugs", () => {
    const slugs = templateMeta.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

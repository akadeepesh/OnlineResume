import { describe, expect, it } from "vitest";
import { parseResume, RESUME_SCHEMA_VERSION, type Resume } from "./schema";

const minimal: Resume = {
  schemaVersion: RESUME_SCHEMA_VERSION,
  profile: {
    name: "Test Person",
    role: "",
    tagline: "",
    location: "",
    avatar: "",
    resumeUrl: "",
    socials: { github: "", linkedin: "", email: "" },
  },
  about: "",
  experience: [],
  projects: [],
  skills: [],
  tools: [],
  education: [],
  certifications: [],
};

describe("parseResume", () => {
  it("accepts a minimal valid resume", () => {
    const result = parseResume(minimal);
    expect(result.success).toBe(true);
  });

  it("rejects non-objects", () => {
    for (const input of [null, undefined, 42, "resume", []]) {
      expect(parseResume(input).success).toBe(false);
    }
  });

  it("rejects an unknown schema version", () => {
    const result = parseResume({ ...minimal, schemaVersion: 999 });
    expect(result.success).toBe(false);
  });

  it("reports readable paths for nested problems", () => {
    const result = parseResume({
      ...minimal,
      profile: { ...minimal.profile, name: "" },
      skills: [{ name: "Go", icon: "not-an-icon", repos: [] }],
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    const paths = result.issues.map((i) => i.path);
    expect(paths).toContain("profile.name");
    expect(paths).toContain("skills.0.icon");
  });

  it("strips unknown keys", () => {
    const result = parseResume({ ...minimal, hacked: true });
    expect(result.success).toBe(true);
    if (result.success) expect("hacked" in result.data).toBe(false);
  });
});

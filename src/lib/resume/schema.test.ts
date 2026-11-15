import { describe, expect, it } from "vitest";
import { parseResume, RESUME_SCHEMA_VERSION, type ResumeInput } from "./schema";

// The smallest input the schema accepts: a version and a name.
const minimal = {
  schemaVersion: RESUME_SCHEMA_VERSION,
  profile: { name: "Test Person" },
} satisfies ResumeInput;

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

  it("fills defaults so templates can rely on lists existing", () => {
    const result = parseResume(minimal);
    expect(result.success).toBe(true);
    if (!result.success) return;
    const { data } = result;
    expect(data.experience).toEqual([]);
    expect(data.certifications).toEqual([]);
    expect(data.profile.socials).toEqual({});
    expect(data.about).toBeUndefined();
  });

  it("only requires the identifying field of each entry", () => {
    const result = parseResume({
      ...minimal,
      experience: [{ title: "Engineer" }],
      projects: [{ name: "Side project" }],
      skills: [{ name: "Go" }],
      tools: [{ name: "Editors" }],
      education: [{ institution: "Some School" }],
      certifications: [{ name: "Cert" }],
    });
    if (!result.success) console.error(result.issues);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.experience[0].responsibilities).toEqual([]);
    expect(result.data.skills[0].icon).toBe("code");
    expect(result.data.certifications[0].icon).toBe("file");
  });

  it("still requires a non-empty name", () => {
    const result = parseResume({ ...minimal, profile: {} });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.issues.map((i) => i.path)).toContain("profile.name");
  });
});

import { describe, expect, it } from "vitest";
import { migrateResume } from "./migrate";
import { parseResumeDraft } from "./draft";
import { DEFAULT_SECTION_ORDER, parseResume, RESUME_SCHEMA_VERSION } from "./schema";

/** A resume as PR #43–#49 saved it: no section order, no hidden sections. */
const v1 = {
  schemaVersion: 1,
  profile: { name: "Old Draft" },
  about: "Written before sections could move.",
  experience: [{ title: "Barista" }],
};

describe("migrateResume", () => {
  it("upgrades a v1 resume to the current version with the default order and nothing hidden", () => {
    expect(migrateResume(v1)).toEqual({
      ...v1,
      schemaVersion: RESUME_SCHEMA_VERSION,
      sectionOrder: [...DEFAULT_SECTION_ORDER],
      hiddenSections: [],
    });
  });

  it("turns v2 repo and site links into project links (v3)", () => {
    const v2 = {
      schemaVersion: 2,
      sectionOrder: [...DEFAULT_SECTION_ORDER],
      hiddenSections: [],
      profile: { name: "Dev" },
      projects: [{ name: "Ledgerly", technologies: ["React"] }],
      skills: [
        { name: "TypeScript", icon: "code", repos: ["ledgerly", "unknown-repo"] },
        { name: "React", icon: "globe", repos: ["Ledgerly"] },
        {
          name: "WordPress",
          icon: "file",
          repos: [],
          sites: [{ title: "Harbor Coffee", url: "https://harbor.example.com", description: "Shop", tags: ["WooCommerce"] }],
        },
      ],
    };
    const result = migrateResume(v2) as typeof v2;
    expect(result.schemaVersion).toBe(3);
    expect(result.skills).toEqual([
      { name: "TypeScript", icon: "code" },
      { name: "React", icon: "globe" },
      { name: "WordPress", icon: "file" },
    ]);
    expect(result.projects).toEqual([
      { name: "Ledgerly", technologies: ["React", "TypeScript"] },
      {
        name: "Harbor Coffee",
        description: "Shop",
        demo: "https://harbor.example.com",
        details: [],
        technologies: ["WordPress", "WooCommerce"],
      },
    ]);
    expect(v2.skills[0]!.repos).toEqual(["ledgerly", "unknown-repo"]); // input untouched
    expect(parseResume(v2).success).toBe(true);
  });

  it("does not mutate its input", () => {
    const input = structuredClone(v1);
    migrateResume(input);
    expect(input).toEqual(v1);
  });

  it("leaves current, unknown-future and non-resume input alone, so validation can reject it", () => {
    const current = { schemaVersion: RESUME_SCHEMA_VERSION, profile: { name: "New" } };
    expect(migrateResume(current)).toBe(current);
    const future = { schemaVersion: RESUME_SCHEMA_VERSION + 1, profile: { name: "Later" } };
    expect(migrateResume(future)).toBe(future);
    for (const input of [null, undefined, 42, "resume", [], {}]) {
      expect(migrateResume(input)).toBe(input);
    }
  });

  it("runs inside parseResume and parseResumeDraft, so old files and drafts still load", () => {
    const strict = parseResume(v1);
    expect(strict.success && strict.data.schemaVersion).toBe(RESUME_SCHEMA_VERSION);
    expect(strict.success && strict.data.about).toBe(v1.about);

    const draft = parseResumeDraft({ ...v1, profile: { name: "" } });
    expect(draft.success && draft.data.sectionOrder).toEqual([...DEFAULT_SECTION_ORDER]);
  });
});

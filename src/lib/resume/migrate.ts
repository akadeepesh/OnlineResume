// ============================================================================
// Resume migrations: bring data saved by an older schema version up to date.
//
// `parseResume` and `parseResumeDraft` run this before validating, so an old
// localStorage draft, an exported JSON file or (later) a database row keeps
// loading after the schema changes.
//
// Rules for adding a step:
// - One function per version bump, applied in order (v1 → v2 → v3 ...).
// - A step is frozen in time. It writes the literal values that version
//   meant, never constants imported from schema.ts, because those may change
//   later and silently rewrite what an old step does.
// - Never mutate the input; never throw. Anything that isn't a resume of a
//   known older version is returned untouched, and validation reports it.
// ============================================================================

type Data = Record<string, unknown>;

/** Each entry upgrades a resume from version `from` to `from + 1`. */
const steps: { from: number; up: (data: Data) => Data }[] = [
  {
    // v2: sections can be reordered and hidden. Old resumes keep the order the
    // editor always showed, with nothing hidden.
    from: 1,
    up: (data) => ({
      ...data,
      schemaVersion: 2,
      sectionOrder: ["about", "experience", "education", "projects", "skills", "tools", "certifications"],
      hiddenSections: [],
    }),
  },
];

const isObject = (value: unknown): value is Data =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export function migrateResume(input: unknown): unknown {
  if (!isObject(input) || typeof input.schemaVersion !== "number") return input;
  let data = input;
  for (const step of steps) {
    if (data.schemaVersion === step.from) data = step.up(data);
  }
  return data;
}

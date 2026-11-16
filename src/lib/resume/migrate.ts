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
  {
    // v3: skills link to the resume's own projects (a project lists the skill
    // in its technologies) instead of GitHub repos and separate "sites".
    // Nothing linked is lost: a repo named like a project tags that project,
    // and each site becomes a project unless one with its URL or name exists.
    from: 2,
    up: (data) => {
      if (!Array.isArray(data.skills)) return { ...data, schemaVersion: 3 };
      const key = (value: unknown) => (typeof value === "string" ? value.trim().toLowerCase().replace(/[\s_]+/g, "-") : "");
      const projects: unknown[] = Array.isArray(data.projects)
        ? data.projects.map((p) => (isObject(p) ? { ...p } : p))
        : [];
      const tag = (project: Data, skill: string) => {
        const list = Array.isArray(project.technologies) ? project.technologies : [];
        const has = list.some((t) => typeof t === "string" && t.trim().toLowerCase() === skill.trim().toLowerCase());
        if (!has) project.technologies = [...list, skill];
      };
      const find = (match: (project: Data) => boolean) =>
        projects.find((p): p is Data => isObject(p) && match(p));

      for (const skill of data.skills) {
        if (!isObject(skill) || typeof skill.name !== "string" || skill.name.trim() === "") continue;
        const name = skill.name.trim();
        for (const repo of Array.isArray(skill.repos) ? skill.repos : []) {
          const project = find((p) => key(p.name) !== "" && key(p.name) === key(repo));
          if (project) tag(project, name);
        }
        for (const site of Array.isArray(skill.sites) ? skill.sites : []) {
          if (!isObject(site)) continue;
          const project = find(
            (p) => (typeof site.url === "string" && p.demo === site.url) || (key(p.name) !== "" && key(p.name) === key(site.title)),
          );
          if (project) {
            tag(project, name);
            continue;
          }
          const tags = Array.isArray(site.tags) ? site.tags.filter((t) => typeof t === "string") : [];
          projects.push({
            name: typeof site.title === "string" ? site.title : "",
            description: typeof site.description === "string" ? site.description : undefined,
            demo: typeof site.url === "string" ? site.url : undefined,
            details: [],
            technologies: [name, ...tags.filter((t) => t.trim().toLowerCase() !== name.toLowerCase())],
          });
        }
      }

      const skills = data.skills.map((skill) =>
        isObject(skill) ? Object.fromEntries(Object.entries(skill).filter(([k]) => k !== "repos" && k !== "sites")) : skill,
      );
      const changedProjects = Array.isArray(data.projects) || projects.length > 0;
      return { ...data, schemaVersion: 3, skills, ...(changedProjects && { projects }) };
    },
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

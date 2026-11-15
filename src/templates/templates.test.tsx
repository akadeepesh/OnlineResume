import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { sampleResume } from "@/lib/resume/sample";
import { parseResume, RESUME_SCHEMA_VERSION, type Resume, type ResumeInput } from "@/lib/resume/schema";
import { emptyItem } from "@/lib/store/editor";
import { templates, type TemplateSlug } from "./index";

// ============================================================================
// Every template must render sparse resumes without broken UI: no
// "undefined", no empty links, no dangling separators and no headings for
// sections that have nothing in them. A fresh draft or a partial import must
// look intentional, not broken.
// ============================================================================

const parse = (input: ResumeInput): Resume => {
  const result = parseResume(input);
  if (!result.success) throw new Error(JSON.stringify(result.issues));
  return result.data;
};

/** The smallest resume the schema accepts: just a name. */
const minimal = parse({
  schemaVersion: RESUME_SCHEMA_VERSION,
  profile: { name: "Sam Lee" },
});

/** What the editor produces once a user clears fields: present but blank. */
const blank = parse({
  schemaVersion: RESUME_SCHEMA_VERSION,
  profile: {
    name: "Sam Lee",
    role: "",
    tagline: " ",
    location: "",
    avatar: "",
    resumeUrl: "",
    availability: "",
    socials: { github: "", linkedin: " ", email: "" },
  },
  about: "   ",
});

/** One item per section, each with only its identifying field. */
const bareItems = parse({
  schemaVersion: RESUME_SCHEMA_VERSION,
  profile: { name: "Sam Lee" },
  experience: [{ title: "Barista" }],
  projects: [{ name: "Recipe Box" }],
  skills: [{ name: "Latte Art" }],
  tools: [{ name: "Espresso Machines" }],
  education: [{ institution: "Riverside College" }],
  certifications: [{ name: "Food Safety Level 2" }],
});

/**
 * What the editor holds right after clicking "Add" in every section, plus an
 * empty bullet and tag: items exist, but nothing has been typed into them.
 */
const freshlyAdded = parse({
  schemaVersion: RESUME_SCHEMA_VERSION,
  profile: { name: "Sam Lee" },
  experience: [{ ...emptyItem.experience(), responsibilities: [""], skills: [" "] }],
  projects: [{ ...emptyItem.projects(), details: [""] }],
  skills: [emptyItem.skills()],
  tools: [{ ...emptyItem.tools(), skills: [""] }],
  education: [emptyItem.education()],
  certifications: [emptyItem.certifications()],
});

const slugs = Object.keys(templates) as TemplateSlug[];
const TEMPLATES_WITH_AVATAR: TemplateSlug[] = ["classic", "spotlight", "bento"];

const render = (slug: TemplateSlug, data: Resume) => {
  const Template = templates[slug];
  return renderToStaticMarkup(<Template data={data} />);
};

/** Visible text only, with tags and React's text separators removed. */
const textOf = (html: string) =>
  html
    .replace(/<!-- -->/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x27;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

/** Words used as section headings across the templates. */
const SECTION_HEADINGS = [
  "About",
  "Profile",
  "Experience",
  "Projects",
  "Selected Work",
  "Skills",
  "Expertise",
  "Tools",
  "Toolbox",
  "Education",
  "Credentials",
  "Certifications",
  "Honours",
  "Based in",
  "Get in touch",
  "Download Resume",
  "Résumé",
  "resume.pdf",
];

function expectNoBrokenMarkup(html: string) {
  const text = textOf(html);
  expect(text).not.toMatch(/\bundefined\b/);
  expect(text).not.toMatch(/\bnull\b/);
  expect(text).not.toMatch(/\bNaN\b/);
  // Empty or half-built links and images
  expect(html).not.toMatch(/\s(href|src)=""/);
  expect(html).not.toMatch(/href="mailto:"/);
  expect(html).not.toContain("mailto:undefined");
  // A separator right after an opening tag or right before a closing tag means
  // one side of "a · b" was missing.
  expect(html).not.toMatch(/<[a-z][^>]*>\s*(<!-- -->)?\s*[·•,]/);
  expect(html).not.toMatch(/[·•,]\s*(<!-- -->)?\s*<\//);
}

describe.each(slugs)("%s template", (slug) => {
  it("renders the full sample resume", () => {
    const html = render(slug, sampleResume);
    expect(textOf(html)).toContain("Alex Morgan");
    const text = textOf(html);
    expect(text).not.toMatch(/\bundefined\b/);
  });

  for (const [label, data] of [
    ["a minimal resume (name only)", minimal],
    ["a resume with blank strings", blank],
    ["freshly added, still empty items", freshlyAdded],
  ] as const) {
    it(`renders ${label} with no broken UI or empty sections`, () => {
      const html = render(slug, data);
      expectNoBrokenMarkup(html);

      const text = textOf(html);
      expect(text).toContain("Sam Lee");
      for (const heading of SECTION_HEADINGS) {
        expect(text, `"${heading}" should not render without content`).not.toMatch(
          new RegExp(`(^|[^\\w])${heading}($|[^\\w])`)
        );
      }
      // Templates with a photo fall back to initials instead of a broken image
      if (TEMPLATES_WITH_AVATAR.includes(slug)) expect(text).toContain("SL");
      expect(html).not.toContain("<img");
    });
  }

  it("renders items that only have their identifying field", () => {
    const html = render(slug, bareItems);
    expectNoBrokenMarkup(html);
    const text = textOf(html);
    const expected = ["Barista", "Latte Art", "Riverside College", "Food Safety Level 2"];
    if (slug === "terminal") {
      // The terminal lists projects as directories, and only shows tools when
      // a visitor runs `tools`.
      expected.push("recipe-box/");
    } else {
      expected.push("Recipe Box", "Espresso Machines");
    }
    for (const value of expected) {
      expect(text, `${value} should be shown`).toContain(value);
    }
  });
});

describe("rich text in every template", () => {
  // Bold is stored as **double asterisks** (the editor's B button writes them).
  // Every field the editor offers bold for must render it, never show the marks.
  const bolded = parse({
    schemaVersion: RESUME_SCHEMA_VERSION,
    profile: { name: "Sam Lee" },
    about: "About with **bold about**.",
    experience: [
      { title: "Engineer", company: "Acme", responsibilities: ["Grew sales by **40%** in a year."] },
    ],
    projects: [{ name: "Tool", details: ["Handles **2M requests**."] }],
  });

  // Terminal is plain text by design: it drops the marks instead of bolding.
  const plainTemplates: TemplateSlug[] = ["terminal"];

  it.each(Object.keys(templates) as TemplateSlug[])("%s renders bold marks, never the raw **", (slug) => {
    const Template = templates[slug];
    const html = renderToStaticMarkup(<Template data={bolded} />);
    expect(html).not.toContain("**");
    for (const phrase of ["bold about", "40%", "2M requests"]) {
      if (!html.includes(phrase)) continue; // some templates don't show every field
      if (plainTemplates.includes(slug)) expect(html).not.toMatch(new RegExp(`<strong[^>]*>${phrase}`));
      else expect(html).toMatch(new RegExp(`<strong[^>]*>${phrase}</strong>`));
    }
    expect(html).toContain("40%"); // every template shows experience bullets
  });

  it.each(Object.keys(templates) as TemplateSlug[])("%s shows no raw marks for the sample", (slug) => {
    const Template = templates[slug];
    expect(renderToStaticMarkup(<Template data={sampleResume} />)).not.toContain("**");
  });
});

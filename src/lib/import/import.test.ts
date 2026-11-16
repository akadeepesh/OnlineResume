import { describe, expect, it } from "vitest";
import { createZip } from "@/lib/zip/zip";
import { docxToText, docxXmlToText } from "./docx";
import { resumeFromText } from "./text-parser";

const SAMPLE = `Priya Shah
Data Analyst | Bengaluru, India
priya@example.com | linkedin.com/in/priyashah | github.com/priyas

SUMMARY
Analyst who turns messy data into decisions.

EXPERIENCE
Senior Analyst at Acme Corp
Jan 2021 – Present
• Cut weekly reporting time by 40% by automating
  dashboards in Looker.
• Led a team of 3 analysts.

Analyst, Beta Ltd
2018 - 2020
- Built the churn model.

EDUCATION
Indian Institute of Technology Delhi
B.Tech, Computer Science
2014 – 2018

PROJECTS
Churn Predictor - Predicts customer churn
https://github.com/priyas/churn
Tech: Python, scikit-learn
• 85% recall on holdout data

SKILLS
SQL, Python, Tableau
Languages: English, Hindi

CERTIFICATIONS
AWS Certified Cloud Practitioner - Amazon 2022
`;

describe("resumeFromText", () => {
  const resume = resumeFromText(SAMPLE)!;

  it("reads the header and contacts", () => {
    expect(resume.profile).toMatchObject({ name: "Priya Shah", role: "Data Analyst", location: "Bengaluru, India" });
    expect(resume.profile.socials).toEqual({
      email: "priya@example.com",
      linkedin: "https://linkedin.com/in/priyashah",
      github: "https://github.com/priyas",
    });
    expect(resume.about).toBe("Analyst who turns messy data into decisions.");
  });

  it("splits experience into roles with dates and bullets", () => {
    expect(resume.experience).toHaveLength(2);
    expect(resume.experience[0]).toMatchObject({
      title: "Senior Analyst",
      company: "Acme Corp",
      date: "Jan 2021 – Present",
      responsibilities: ["Cut weekly reporting time by 40% by automating dashboards in Looker.", "Led a team of 3 analysts."],
    });
    expect(resume.experience[1]).toMatchObject({ title: "Analyst", company: "Beta Ltd", date: "2018 – 2020" });
  });

  it("reads education, projects, skills and certifications", () => {
    expect(resume.education[0]).toMatchObject({
      institution: "Indian Institute of Technology Delhi",
      degree: "B.Tech, Computer Science",
      period: "2014 – 2018",
    });
    expect(resume.projects[0]).toMatchObject({
      name: "Churn Predictor",
      description: "Predicts customer churn",
      github: "https://github.com/priyas/churn",
      technologies: ["Python", "scikit-learn"],
      details: ["85% recall on holdout data"],
    });
    expect(resume.skills.map((s) => s.name)).toEqual(["SQL", "Python", "Tableau"]);
    expect(resume.tools).toEqual([{ name: "Languages", skills: ["English", "Hindi"] }]);
    expect(resume.certifications[0]).toMatchObject({ name: "AWS Certified Cloud Practitioner", issuer: "Amazon", date: "2022" });
  });

  it("keeps text without headings as the summary, and refuses empty input", () => {
    const loose = resumeFromText("Sam Lee\nI build furniture and fix bikes.");
    expect(loose?.profile.name).toBe("Sam Lee");
    expect(loose?.about).toBe("I build furniture and fix bikes.");
    expect(resumeFromText("   \n  ")).toBeNull();
  });
});

describe("docx", () => {
  const body = `<w:document><w:body>
    <w:p><w:r><w:t>Priya Shah</w:t></w:r></w:p>
    <w:p><w:pPr><w:numPr><w:ilvl w:val="0"/></w:numPr></w:pPr><w:r><w:t xml:space="preserve">Cut costs </w:t></w:r><w:r><w:t>by 40% &amp; more</w:t></w:r></w:p>
    <w:p><w:r><w:t>Python</w:t><w:tab/><w:t>SQL</w:t></w:r></w:p>
    <w:p></w:p>
  </w:body></w:document>`;

  it("turns document XML into lines, with list items as bullets", () => {
    expect(docxXmlToText(body)).toBe("Priya Shah\n• Cut costs by 40% & more\nPython\tSQL");
  });

  it("reads a .docx file", async () => {
    const file = await createZip([
      { name: "[Content_Types].xml", data: "<Types/>" },
      { name: "word/document.xml", data: body },
    ]);
    expect(await docxToText(file)).toContain("• Cut costs by 40% & more");
    await expect(docxToText(await createZip([{ name: "x.txt", data: "x" }]))).rejects.toThrow(/isn't a Word/);
  });
});

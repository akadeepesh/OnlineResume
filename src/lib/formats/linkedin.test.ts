import { describe, expect, it } from "vitest";
import { createZip } from "@/lib/zip/zip";
import { csvRecords, parseCsv } from "./csv";
import { readLinkedInExport } from "./linkedin";

describe("csv", () => {
  it("handles quotes, escaped quotes, commas and newlines in fields", () => {
    expect(parseCsv('a,b\r\n"x, y","say ""hi"""\n"multi\nline",z\n')).toEqual([
      ["a", "b"],
      ["x, y", 'say "hi"'],
      ["multi\nline", "z"],
    ]);
  });

  it("maps rows to loosely matched headers and skips blank lines", () => {
    expect(csvRecords("﻿First Name,Started On\nAda,Mar 2021\n\n")).toEqual([
      { firstname: "Ada", startedon: "Mar 2021" },
    ]);
  });
});

describe("LinkedIn export", () => {
  const files = [
    {
      name: "Profile.csv",
      data: 'First Name,Last Name,Headline,Summary,Geo Location\nAda,Lovelace,Analyst,"Loves numbers, and engines.",London\n',
    },
    {
      name: "Positions.csv",
      data:
        'Company Name,Title,Description,Location,Started On,Finished On\n' +
        'Babbage & Co,Programmer,"- Wrote the first program\n- Explained the engine",London,Jan 1842,Dec 1843\n' +
        "Royal Society,Advisor,,,Mar 1850,\n",
    },
    { name: "Education.csv", data: "School Name,Start Date,End Date,Degree Name\nHome tutoring,1825,1835,Mathematics\n" },
    { name: "Skills.csv", data: "Name\nMathematics\nAnalysis\n" },
    { name: "Certifications.csv", data: "Name,Url,Authority,Started On\nFRS,javascript:alert(1),Royal Society,1851\n" },
    { name: "Email Addresses.csv", data: "Email Address,Confirmed,Primary\nold@example.com,Yes,No\nada@example.com,Yes,Yes\n" },
    { name: "messages.csv", data: "lots of private messages we never read" },
  ];

  it("reads the export into a resume", async () => {
    const result = await readLinkedInExport(await createZip(files));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const { resume } = result;
    expect(resume.profile).toMatchObject({ name: "Ada Lovelace", role: "Analyst", location: "London" });
    expect(resume.profile.socials).toEqual({ email: "ada@example.com" });
    expect(resume.about).toBe("Loves numbers, and engines.");
    expect(resume.experience[0]).toMatchObject({
      title: "Programmer",
      company: "Babbage & Co",
      date: "Jan 1842 – Dec 1843",
      responsibilities: ["Wrote the first program", "Explained the engine"],
    });
    expect(resume.experience[1]!.date).toBe("Mar 1850 – Present");
    expect(resume.education[0]).toMatchObject({ institution: "Home tutoring", degree: "Mathematics", period: "1825 – 1835" });
    expect(resume.skills.map((s) => s.name)).toEqual(["Mathematics", "Analysis"]);
    expect(resume.certifications[0]).toMatchObject({ name: "FRS", issuer: "Royal Society" });
    expect(resume.certifications[0]!.link).toBeUndefined(); // unsafe URL dropped
  });

  it("finds the CSVs inside a folder too", async () => {
    const nested = files.map((f) => ({ ...f, name: `Basic_LinkedInDataExport/${f.name}` }));
    const result = await readLinkedInExport(await createZip(nested));
    expect(result.ok && result.resume.profile.name).toBe("Ada Lovelace");
  });

  it("explains when the ZIP isn't a LinkedIn export", async () => {
    const result = await readLinkedInExport(await createZip([{ name: "photo.jpg", data: "x" }]));
    expect(result).toEqual({ ok: false, error: expect.stringMatching(/isn't a LinkedIn/) });
  });
});

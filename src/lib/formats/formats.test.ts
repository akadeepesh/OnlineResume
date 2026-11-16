import { describe, expect, it } from "vitest";
import { sampleResume } from "@/lib/resume/sample";
import { formatDateRange, fromIsoPartial, parseDateRange, toIsoPartial } from "./dates";
import { exportFileName, readResumeJson, toJsonResumeText, toResumeJson } from "./files";
import { fromJsonResume, isJsonResume, toJsonResume } from "./jsonresume";

describe("dates", () => {
  it("reads common date shapes", () => {
    expect(toIsoPartial("2021")).toBe("2021");
    expect(toIsoPartial("Mar 2021")).toBe("2021-03");
    expect(toIsoPartial("September 2020")).toBe("2020-09");
    expect(toIsoPartial("03/2021")).toBe("2021-03");
    expect(toIsoPartial("2021-3")).toBe("2021-03");
    expect(toIsoPartial("Spring 2021")).toBeNull();
    expect(toIsoPartial("13/2021")).toBeNull();
  });

  it("reads ranges, ongoing roles and single ISO dates", () => {
    expect(parseDateRange("Mar 2021 – Present")).toEqual({ startDate: "2021-03" });
    expect(parseDateRange("2019 - 2021")).toEqual({ startDate: "2019", endDate: "2021" });
    expect(parseDateRange("2019-2021")).toEqual({ startDate: "2019", endDate: "2021" });
    expect(parseDateRange("Jan 2018 to Dec 2019")).toEqual({ startDate: "2018-01", endDate: "2019-12" });
    expect(parseDateRange("2021-03")).toEqual({ startDate: "2021-03" });
    expect(parseDateRange("whenever")).toEqual({});
    expect(parseDateRange(undefined)).toEqual({});
  });

  it("formats ISO dates for people", () => {
    expect(fromIsoPartial("2021-03-15")).toBe("Mar 2021");
    expect(fromIsoPartial("2021")).toBe("2021");
    expect(formatDateRange("2021-03")).toBe("Mar 2021 – Present");
    expect(formatDateRange("2019", "2021-06")).toBe("2019 – Jun 2021");
    expect(formatDateRange(undefined, "2020")).toBe("2020");
    expect(formatDateRange()).toBe("");
  });
});

describe("JSON Resume", () => {
  const external = {
    basics: {
      name: "Jane Doe",
      label: "Designer",
      email: "jane@example.com",
      summary: "Designs things.",
      location: { city: "Berlin", countryCode: "DE" },
      profiles: [{ network: "LinkedIn", url: "https://linkedin.com/in/jane" }],
    },
    work: [{ name: "Acme", position: "Lead Designer", startDate: "2020-02", highlights: ["Shipped **v2**"] }],
    education: [{ institution: "UdK", studyType: "BA", area: "Design", endDate: "2016" }],
    skills: [{ name: "Design", keywords: ["Figma", "Sketch"] }, { name: "Typography" }],
    certificates: [{ name: "UX Cert", date: "2019-05-01", issuer: "NN/g" }],
  };

  it("detects the format", () => {
    expect(isJsonResume(external)).toBe(true);
    expect(isJsonResume(sampleResume)).toBe(false);
    expect(isJsonResume(null)).toBe(false);
  });

  it("imports into our model", () => {
    const resume = fromJsonResume(external);
    expect(resume.profile).toMatchObject({ name: "Jane Doe", role: "Designer", location: "Berlin, DE" });
    expect(resume.profile.socials).toEqual({ email: "jane@example.com", linkedin: "https://linkedin.com/in/jane" });
    expect(resume.experience[0]).toMatchObject({ title: "Lead Designer", company: "Acme", date: "Feb 2020 – Present" });
    expect(resume.education[0]).toMatchObject({ institution: "UdK", degree: "BA, Design", period: "2016" });
    expect(resume.tools).toEqual([{ name: "Design", skills: ["Figma", "Sketch"] }]);
    expect(resume.skills.map((s) => s.name)).toEqual(["Typography"]);
    expect(resume.certifications[0]).toMatchObject({ name: "UX Cert", date: "May 2019", issuer: "NN/g" });
  });

  it("exports the sample without losing the essentials", () => {
    const out = toJsonResume(sampleResume);
    expect(out.basics?.name).toBe(sampleResume.profile.name);
    expect(out.work).toHaveLength(sampleResume.experience.length);
    expect(out.work?.[0]?.position).toBe(sampleResume.experience[0]!.title);
    expect(JSON.stringify(out)).not.toContain("data:image"); // photos as data URLs stay out
  });

  it("survives a round trip through JSON Resume", () => {
    const back = readResumeJson(toJsonResumeText(sampleResume));
    expect(back.ok).toBe(true);
    if (!back.ok) return;
    expect(back.format).toBe("jsonresume");
    expect(back.resume.profile.name).toBe(sampleResume.profile.name);
    expect(back.resume.experience.map((e) => e.title)).toEqual(sampleResume.experience.map((e) => e.title));
  });
});

describe("resume files", () => {
  it("re-imports our own format losslessly", () => {
    const back = readResumeJson(toResumeJson(sampleResume));
    expect(back).toEqual({ ok: true, resume: sampleResume, format: "onlineresume" });
  });

  it("explains what's wrong with bad files", () => {
    expect(readResumeJson("{nope")).toEqual({ ok: false, error: expect.stringMatching(/valid JSON/) });
    expect(readResumeJson(JSON.stringify({ hello: 1 }))).toEqual({
      ok: false,
      error: expect.stringMatching(/recognise/),
    });
    expect(readResumeJson("x".repeat(1024 * 1024 + 1))).toEqual({
      ok: false,
      error: expect.stringMatching(/too large/),
    });
  });

  it("names exported files after the person", () => {
    expect(exportFileName(sampleResume, "resume")).toMatch(/^[a-z0-9-]+-resume\.json$/);
    const unnamed = { ...sampleResume, profile: { ...sampleResume.profile, name: " " } };
    expect(exportFileName(unnamed, "jsonresume")).toBe("resume-jsonresume.json");
  });
});

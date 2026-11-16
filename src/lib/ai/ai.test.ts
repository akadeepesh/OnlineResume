import { describe, expect, it, vi } from "vitest";
import { resumeFromExtraction } from "./extracted";
import { ExtractionError, groqExtractor } from "./groq";

describe("resumeFromExtraction", () => {
  it("builds a resume from a well-formed answer", () => {
    const resume = resumeFromExtraction({
      name: "Priya Shah",
      role: "Data Analyst",
      email: "priya@example.com",
      linkedin: "linkedin.com/in/priya",
      summary: "Turns messy data into decisions.",
      experience: [{ title: "Analyst", company: "Acme", date: "2021 – Present", bullets: ["Cut reporting time by 40%"] }],
      education: [{ institution: "IIT Delhi", degree: "B.Tech", period: "2017 – 2021" }],
      projects: [{ name: "Churn model", url: "github.com/priya/churn", technologies: ["Python"] }],
      skills: ["SQL", "Python"],
      toolGroups: [{ name: "BI", items: ["Tableau", "Looker"] }],
      certifications: [{ name: "AWS CCP", issuer: "AWS", date: 2022 }],
    });
    expect(resume).not.toBeNull();
    expect(resume!.profile).toMatchObject({ name: "Priya Shah", role: "Data Analyst" });
    expect(resume!.profile.socials).toEqual({ email: "priya@example.com", linkedin: "https://linkedin.com/in/priya" });
    expect(resume!.experience[0]).toMatchObject({ title: "Analyst", responsibilities: ["Cut reporting time by 40%"] });
    expect(resume!.projects[0]).toMatchObject({ github: "https://github.com/priya/churn", technologies: ["Python"] });
    expect(resume!.projects[0]!.demo).toBeUndefined();
    expect(resume!.skills.map((s) => s.name)).toEqual(["SQL", "Python"]);
    expect(resume!.tools).toEqual([{ name: "BI", skills: ["Tableau", "Looker"] }]);
    expect(resume!.certifications[0]!.date).toBe("2022");
  });

  it("ignores junk and unsafe values instead of failing", () => {
    const resume = resumeFromExtraction({
      name: "Sam",
      email: "not-an-email",
      github: "javascript:alert(1)",
      experience: ["oops", null, { title: 42, bullets: [1, null, " keep me "] }],
      skills: [{ nested: true }, "Go"],
      extra: { ignored: true },
    });
    expect(resume!.profile.socials).toEqual({});
    expect(resume!.experience).toEqual([
      expect.objectContaining({ title: "42", responsibilities: ["1", "keep me"] }),
    ]);
    expect(resume!.skills.map((s) => s.name)).toEqual(["Go"]);
  });

  it("returns null when nothing usable came back", () => {
    expect(resumeFromExtraction(null)).toBeNull();
    expect(resumeFromExtraction([])).toBeNull();
    expect(resumeFromExtraction({})).toBeNull();
    expect(resumeFromExtraction({ name: "  ", skills: [] })).toBeNull();
  });
});

describe("groqExtractor", () => {
  const reply = (content: unknown, status = 200) =>
    vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ choices: [{ message: { content } }] }), { status }),
    ) as unknown as typeof fetch;

  it("sends the text and parses the JSON answer", async () => {
    const fetchMock = reply(JSON.stringify({ name: "Priya" }));
    const result = await groqExtractor("key", "model-x", fetchMock).extract("Priya Shah, analyst");
    expect(result).toEqual({ name: "Priya" });
    const [, init] = (fetchMock as unknown as ReturnType<typeof vi.fn>).mock.calls[0]!;
    const body = JSON.parse(init.body);
    expect(body.model).toBe("model-x");
    expect(body.response_format).toEqual({ type: "json_object" });
    expect(body.messages[1].content).toContain("Priya Shah, analyst");
    expect(init.headers.Authorization).toBe("Bearer key");
  });

  it("fails clearly on bad answers", async () => {
    await expect(groqExtractor("k", "m", reply("not json")).extract("x")).rejects.toBeInstanceOf(ExtractionError);
    await expect(groqExtractor("k", "m", reply(null)).extract("x")).rejects.toBeInstanceOf(ExtractionError);
    await expect(groqExtractor("k", "m", reply("{}", 429)).extract("x")).rejects.toThrow(/429/);
  });
});

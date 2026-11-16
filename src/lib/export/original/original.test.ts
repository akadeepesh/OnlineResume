import { PDFDocument, StandardFonts } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { pdfToText } from "@/lib/import/pdf";
import { blankResume } from "@/lib/resume/draft";
import type { Resume } from "@/lib/resume/schema";
import { createZip, openZip } from "@/lib/zip/zip";
import { patchDocumentXml, patchDocx } from "./docx";
import { patchPdf } from "./pdf";
import { planPatches, textChanges } from "./plan";

function resume(patch: (r: Resume) => void): Resume {
  const r = blankResume();
  r.profile.name = "Priya Shah";
  r.profile.role = "Data Analyst";
  r.experience = [{ title: "Analyst", company: "Acme", date: "2021 – Present", responsibilities: ["Built dashboards"], skills: [] }];
  patch(r);
  return r;
}

describe("textChanges", () => {
  it("lists changed, added and removed texts by path", () => {
    const before = resume(() => {});
    const after = resume((r) => {
      r.profile.role = "Senior Data Analyst";
      r.experience[0]!.responsibilities = ["Built dashboards", "Mentored two analysts"];
      r.experience[0]!.company = "";
    });
    expect(textChanges(before, after)).toEqual([
      { path: "profile.role", label: "Role", from: "Data Analyst", to: "Senior Data Analyst" },
      { path: "experience[0].company", label: "Experience 1: company", from: "Acme", to: "" },
      { path: "experience[0].responsibilities[1]", label: "Experience 1: bullet 2", from: "", to: "Mentored two analysts" },
    ]);
  });
});

describe("planPatches", () => {
  it("prefers exact lines, combines changes on one line, and reports what it can't place", () => {
    const plan = planPatches(
      ["Priya Shah", "Analyst at Acme", "Analyst"],
      [
        { path: "a", label: "a", from: "Analyst", to: "Lead" },
        { path: "b", label: "b", from: "Acme", to: "Beta" },
        { path: "c", label: "c", from: "", to: "New bullet" },
        { path: "d", label: "d", from: "Not in the file", to: "x" },
      ],
    );
    expect([...plan.lines]).toEqual([
      [2, "Lead"],
      [1, "Analyst at Beta"],
    ]);
    expect(plan.applied.map((c) => c.path)).toEqual(["a", "b"]);
    expect(plan.unapplied.map((c) => c.path)).toEqual(["c", "d"]);
  });
});

describe("Word patching", () => {
  const xml =
    '<w:body><w:p><w:pPr><w:pStyle w:val="Title"/></w:pPr><w:r><w:rPr><w:b/></w:rPr><w:t>Priya</w:t></w:r><w:r><w:t xml:space="preserve"> Shah</w:t></w:r></w:p>' +
    "<w:p><w:r><w:t>Data Analyst &amp; Engineer</w:t></w:r></w:p></w:body>";

  it("rewrites only the changed paragraphs, keeping their style", () => {
    const { xml: out, plan } = patchDocumentXml(xml, [
      { path: "profile.role", label: "Role", from: "Data Analyst & Engineer", to: "Lead Analyst <R&D>" },
    ]);
    expect(plan.applied).toHaveLength(1);
    expect(out).toContain('<w:pStyle w:val="Title"/></w:pPr><w:r><w:rPr><w:b/></w:rPr><w:t>Priya</w:t>');
    expect(out).toContain('<w:t xml:space="preserve">Lead Analyst &lt;R&amp;D&gt;</w:t>');
  });

  it("matches text split across runs and keeps the other package parts", async () => {
    const file = await createZip([
      { name: "[Content_Types].xml", data: "<Types/>" },
      { name: "word/document.xml", data: xml },
      { name: "word/media/photo.bin", data: new Uint8Array([1, 2, 3]) },
    ]);
    const { file: out, plan } = await patchDocx(file, [{ path: "profile.name", label: "Name", from: "Priya Shah", to: "Priya S. Rao" }]);
    expect(plan.applied).toHaveLength(1);
    const zip = await openZip(out);
    expect(zip.names).toEqual(["[Content_Types].xml", "word/document.xml", "word/media/photo.bin"]);
    expect(await zip.text("word/document.xml")).toContain("Priya S. Rao");
    expect(await zip.read("word/media/photo.bin")).toEqual(new Uint8Array([1, 2, 3]));
  });
});

describe("PDF", () => {
  async function makePdf(lines: string[]) {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const page = doc.addPage([595, 842]);
    lines.forEach((text, i) => page.drawText(text, { x: 50, y: 780 - i * 24, size: 12, font }));
    return doc.save();
  }

  it("reads text and line positions", async () => {
    const { text, lines } = await pdfToText(await makePdf(["Priya Shah", "Data Analyst", "Built dashboards for sales"]));
    expect(text).toBe("Priya Shah\nData Analyst\nBuilt dashboards for sales");
    expect(lines[0]).toMatchObject({ page: 1, text: "Priya Shah" });
    expect(lines[0]!.x).toBeCloseTo(50, 0);
    expect(lines[1]!.y).toBeLessThan(lines[0]!.y);
  });

  it("refuses PDFs without text", async () => {
    const doc = await PDFDocument.create();
    doc.addPage();
    await expect(pdfToText(await doc.save())).rejects.toThrow(/no selectable text/);
  });

  it("draws changed lines over the original", async () => {
    const original = await makePdf(["Priya Shah", "Data Analyst", "Built dashboards for sales"]);
    const { lines } = await pdfToText(original);
    const { file, plan } = await patchPdf(original, lines, [
      { path: "profile.role", label: "Role", from: "Data Analyst", to: "Senior Data Analyst" },
      { path: "x", label: "x", from: "", to: "Added later" },
    ]);
    expect(plan.applied).toHaveLength(1);
    expect(plan.unapplied).toHaveLength(1);
    const { text } = await pdfToText(file);
    expect(text).toContain("Senior Data Analyst");
  });
});

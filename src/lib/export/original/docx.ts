import { createZip, openZip } from "@/lib/zip/zip";
import { planPatches, type PatchPlan, type TextChange } from "./plan";

// ============================================================================
// Apply text changes to the original Word file. Only word/document.xml
// changes; every other part of the package (styles, images, headers) is
// copied as is. A changed paragraph keeps its paragraph and first-run
// formatting; mixed formatting inside that one paragraph is simplified.
// ============================================================================

const PARAGRAPH = /<w:p[\s>][\s\S]*?<\/w:p>/g;
const TEXT = /<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g;

const decode = (text: string) =>
  text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
    .replace(/&amp;/g, "&");

const encode = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const paragraphText = (xml: string) => [...xml.matchAll(TEXT)].map((m) => decode(m[1]!)).join("");

/** Rewrite one paragraph so its text is `text`: the first run gets it all, the others are emptied. */
function rewriteParagraph(xml: string, text: string): string {
  let first = true;
  return xml.replace(TEXT, () => {
    if (!first) return "<w:t></w:t>";
    first = false;
    return `<w:t xml:space="preserve">${encode(text)}</w:t>`;
  });
}

export function patchDocumentXml(xml: string, changes: TextChange[]): { xml: string; plan: PatchPlan } {
  const paragraphs = [...xml.matchAll(PARAGRAPH)].map((m) => ({ start: m.index!, xml: m[0] }));
  const plan = planPatches(
    paragraphs.map((p) => paragraphText(p.xml)),
    changes,
  );
  let out = "";
  let cursor = 0;
  paragraphs.forEach((paragraph, index) => {
    const next = plan.lines.get(index);
    if (next === undefined) return;
    out += xml.slice(cursor, paragraph.start) + rewriteParagraph(paragraph.xml, next);
    cursor = paragraph.start + paragraph.xml.length;
  });
  return { xml: out + xml.slice(cursor), plan };
}

export async function patchDocx(bytes: Uint8Array, changes: TextChange[]): Promise<{ file: Uint8Array; plan: PatchPlan }> {
  const zip = await openZip(bytes);
  const documentXml = await zip.text("word/document.xml");
  if (!documentXml) throw new Error("The original isn't a Word document.");
  const { xml, plan } = patchDocumentXml(documentXml, changes);

  const files = [];
  for (const name of zip.names) {
    files.push({ name, data: name === "word/document.xml" ? xml : (await zip.read(name))! });
  }
  return { file: await createZip(files), plan };
}

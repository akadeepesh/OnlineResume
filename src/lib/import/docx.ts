import { openZip } from "@/lib/zip/zip";

// ============================================================================
// Plain text from a Word document (.docx). A .docx is a ZIP; the body is
// word/document.xml. We only need the text in reading order, one paragraph
// per line, with list items marked as bullets, so a few regular expressions
// do the job and run the same in the browser and on the server.
// ============================================================================

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };

function decodeXml(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] === "#") {
      const point = code[1]?.toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(point) && point > 0 && point <= 0x10ffff ? String.fromCodePoint(point) : "";
    }
    return ENTITIES[code.toLowerCase()] ?? match;
  });
}

/** Text of one <w:p> paragraph. */
function paragraphText(xml: string): string {
  let text = "";
  const tokens = /<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>|<w:tab\s*\/>|<w:br\s*\/>|<w:cr\s*\/>/g;
  for (const match of xml.matchAll(tokens)) {
    if (match[1] !== undefined) text += decodeXml(match[1]);
    else if (match[0].startsWith("<w:tab")) text += "\t";
    else text += "\n";
  }
  return text;
}

/** The document body as plain text: paragraphs on their own lines, list items as "• ". */
export function docxXmlToText(documentXml: string): string {
  const lines: string[] = [];
  for (const match of documentXml.matchAll(/<w:p[\s>][\s\S]*?<\/w:p>/g)) {
    const xml = match[0];
    const text = paragraphText(xml).replace(/[  ]+/g, " ").trim();
    if (!text) continue;
    const isListItem = /<w:numPr>/.test(xml);
    lines.push(isListItem ? `• ${text}` : text);
  }
  return lines.join("\n");
}

export class DocxError extends Error {}

/** Read a .docx file's text. */
export async function docxToText(bytes: Uint8Array): Promise<string> {
  let xml: string | null;
  try {
    const zip = await openZip(bytes, { maxEntries: 2000, maxFileBytes: 15 * 1024 * 1024, maxTotalBytes: 15 * 1024 * 1024 });
    xml = await zip.text("word/document.xml");
  } catch {
    throw new DocxError("That Word file couldn't be opened.");
  }
  if (!xml) throw new DocxError("That file isn't a Word document (.docx).");
  return docxXmlToText(xml);
}

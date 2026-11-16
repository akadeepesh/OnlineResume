// ============================================================================
// Text from a PDF with pdf.js (server side). Besides the plain text, every
// line's position is kept: "edited original" export uses it to write changes
// back onto the original pages.
//
// Only text-based PDFs work: a scanned resume is an image with no text, and
// we say so instead of importing an empty resume.
// ============================================================================

/** One line of text as it sits on a page (PDF units, origin bottom-left). */
export interface PdfLine {
  page: number;
  text: string;
  x: number;
  y: number;
  width: number;
  /** Font size, roughly the line's height. */
  size: number;
}

export class PdfError extends Error {}

/** Resumes are short; refuse anything that clearly isn't one. */
const MAX_PAGES = 10;

interface TextItemLike {
  str: string;
  transform: number[];
  width: number;
  height: number;
  hasEOL: boolean;
}

async function loadPdfJs() {
  // In Node, pdf.js runs its "worker" on the main thread once the worker
  // module is loaded; importing it first avoids a file lookup at runtime.
  await import("pdfjs-dist/legacy/build/pdf.worker.mjs");
  return import("pdfjs-dist/legacy/build/pdf.mjs");
}

export async function pdfToText(bytes: Uint8Array): Promise<{ text: string; lines: PdfLine[] }> {
  const pdfjs = await loadPdfJs();
  const task = pdfjs.getDocument({
    data: bytes.slice(), // pdf.js takes ownership of the buffer
    disableFontFace: true,
    useSystemFonts: false,
    stopAtErrors: false,
  });
  let doc;
  try {
    doc = await task.promise;
  } catch (error) {
    const name = (error as { name?: string } | null)?.name;
    throw new PdfError(name === "PasswordException" ? "That PDF is password-protected." : "That PDF couldn't be opened.");
  }

  try {
    if (doc.numPages > MAX_PAGES) throw new PdfError(`That PDF has ${doc.numPages} pages. Resumes up to ${MAX_PAGES} pages work.`);
    const lines: PdfLine[] = [];
    for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
      const page = await doc.getPage(pageNumber);
      const content = await page.getTextContent();
      let current: PdfLine | null = null;
      for (const raw of content.items) {
        if (!("str" in raw)) continue;
        const item = raw as TextItemLike;
        const [, , c = 0, d = 0, x = 0, y = 0] = item.transform;
        const size = Math.hypot(c, d) || item.height || 10;
        if (item.str !== "") {
          if (current && Math.abs(current.y - y) > size * 0.5) {
            lines.push(current); // moved to another line without an explicit end-of-line
            current = null;
          }
          if (!current) current = { page: pageNumber, text: item.str, x, y, width: item.width, size };
          else {
            const gap = x - (current.x + current.width);
            current.text += gap > size * 0.15 && !current.text.endsWith(" ") && !item.str.startsWith(" ") ? ` ${item.str}` : item.str;
            current.width = Math.max(current.width, x + item.width - current.x);
            current.size = Math.max(current.size, size);
          }
        }
        if (item.hasEOL && current) {
          lines.push(current);
          current = null;
        }
      }
      if (current) lines.push(current);
      page.cleanup();
    }
    const cleaned = lines
      .map((line) => ({ ...line, text: line.text.replace(/\s+/g, " ").trim() }))
      .filter((line) => line.text !== "");
    const text = cleaned.map((line) => line.text).join("\n");
    if (text.replace(/\s/g, "").length < 20) {
      throw new PdfError("That PDF has no selectable text (it may be a scan). Paste the text instead.");
    }
    return { text, lines: cleaned };
  } finally {
    await task.destroy();
  }
}

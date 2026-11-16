import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import type { PdfLine } from "@/lib/import/pdf";
import { planPatches, type PatchPlan, type TextChange } from "./plan";

// ============================================================================
// Apply text changes to the original PDF (experimental). PDFs don't have
// editable text, so each changed line is covered with a white box and the new
// line is drawn on top in Helvetica at the original size, shrunk to fit the
// original width. It looks right on white backgrounds with simple fonts; the
// report tells the person what couldn't be applied.
// ============================================================================

const MIN_SHRINK = 0.6;

export async function patchPdf(
  bytes: Uint8Array,
  lines: PdfLine[],
  changes: TextChange[],
): Promise<{ file: Uint8Array; plan: PatchPlan }> {
  const plan = planPatches(
    lines.map((line) => line.text),
    changes,
  );
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: false });
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const pages = doc.getPages();

  for (const [index, text] of plan.lines) {
    const line = lines[index]!;
    const page = pages[line.page - 1];
    if (!page) continue;

    // Helvetica only covers Latin text; characters it can't draw would throw.
    let safe: string;
    try {
      font.encodeText(text);
      safe = text;
    } catch {
      safe = "";
    }
    if (text && !safe) {
      // Can't draw it: leave the original line alone and report the changes on it.
      const moved = plan.applied.filter((change) => lines[index]!.text.includes(change.from));
      plan.applied = plan.applied.filter((change) => !moved.includes(change));
      plan.unapplied.push(...moved);
      continue;
    }

    page.drawRectangle({
      x: line.x - 1,
      y: line.y - line.size * 0.28,
      width: line.width + 2,
      height: line.size * 1.25,
      color: rgb(1, 1, 1),
    });
    if (!safe) continue; // the change removed the whole line

    let size = line.size;
    const width = font.widthOfTextAtSize(safe, size);
    if (width > line.width * 1.02) size = Math.max(line.size * MIN_SHRINK, (size * line.width) / width);
    page.drawText(safe, { x: line.x, y: line.y, size, font, color: rgb(0.08, 0.08, 0.08) });
  }

  return { file: await doc.save(), plan };
}

import { resumeFromExtraction } from "@/lib/ai/extracted";
import { DEFAULT_GROQ_MODEL, groqExtractor } from "@/lib/ai/groq";
import { consumeAiImport } from "@/lib/ai/usage";
import { serverEnv } from "@/lib/env";
import { limitsFor } from "@/lib/limits";
import { allow, TOO_MANY } from "@/lib/rate-limit";
import type { Resume } from "@/lib/resume/schema";
import { DOCX_MIME, PDF_MIME, saveOriginal } from "@/lib/resumes/originals";
import { deleteResume, insertResume, resumeQuota, userPlan } from "@/lib/resumes/queries";
import { RESUME_TITLE_MAX, slugify } from "@/lib/resumes/slug";
import { looksLikeZip } from "@/lib/zip/zip";
import { DocxError, docxToText } from "./docx";
import { PdfError, pdfToText, type PdfLine } from "./pdf";
import type { SourceMap } from "./source-map";
import { resumeFromText } from "./text-parser";

// ============================================================================
// Import from an uploaded document: check the file, pull out its text, turn
// the text into a resume (AI when configured and within today's limit, the
// rule-based parser otherwise or when AI fails), then save the resume and the
// untouched original.
// ============================================================================

/** Vercel caps request bodies at 4.5 MB; stay under it. */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

export type DocumentImport =
  | { ok: true; id: string; usedAi: boolean }
  | { ok: false; error: string; status: number };

const fail = (error: string, status = 400): DocumentImport => ({ ok: false, error, status });

/** A safe file name to store and send back later. */
export function cleanFileName(name: string, extension: string): string {
  const base = name
    .replace(/\.[^.]+$/, "")
    .normalize("NFKD")
    .replace(/[^\w\s.-]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
  return `${base || "resume"}.${extension}`;
}

async function structure(text: string, userId: string): Promise<{ resume: Resume | null; usedAi: boolean }> {
  const { GROQ_API_KEY, GROQ_MODEL } = serverEnv();
  if (GROQ_API_KEY) {
    const usage = await consumeAiImport(userId, limitsFor(await userPlan(userId)).aiImportsPerDay);
    if (usage.allowed) {
      try {
        const resume = resumeFromExtraction(
          await groqExtractor(GROQ_API_KEY, GROQ_MODEL ?? DEFAULT_GROQ_MODEL).extract(text.slice(0, 20_000)),
        );
        if (resume) return { resume, usedAi: true };
      } catch (error) {
        console.error("AI import failed, using the rule-based parser", error);
      }
    }
  }
  return { resume: resumeFromText(text), usedAi: false };
}

export async function importDocument(userId: string, file: File): Promise<DocumentImport> {
  if (!(await allow("createResume", userId))) return fail(TOO_MANY, 429);
  const { used, limit } = await resumeQuota(userId);
  if (used >= limit) return fail(`You can keep up to ${limit} resumes. Delete one to make room.`, 403);

  if (file.size === 0) return fail("That file is empty.");
  if (file.size > MAX_UPLOAD_BYTES) return fail("That file is too large (4 MB max).", 413);
  const bytes = new Uint8Array(await file.arrayBuffer());

  // Trust the bytes, not the name or the browser's type.
  const isPdf = new TextDecoder().decode(bytes.subarray(0, 5)) === "%PDF-";
  if (!isPdf && !looksLikeZip(bytes)) return fail("Upload a PDF or a Word document (.docx).", 415);
  let text: string;
  let lines: PdfLine[] = [];
  try {
    if (isPdf) ({ text, lines } = await pdfToText(bytes));
    else text = await docxToText(bytes);
  } catch (error) {
    const known = error instanceof DocxError || error instanceof PdfError;
    if (!known) console.error("Document import failed", error);
    return fail(known ? error.message : "That file couldn't be read.", 415);
  }
  if (text.trim().length < 20) return fail("That document has almost no text to import.");

  const { resume, usedAi } = await structure(text, userId);
  if (!resume) return fail("We couldn't find a resume in that document.", 422);

  const extension = isPdf ? "pdf" : "docx";
  const fileName = cleanFileName(file.name, extension);
  const title = (resume.profile.name.trim() || fileName.replace(/\.(pdf|docx)$/, "")).slice(0, RESUME_TITLE_MAX);
  const sourceMap: SourceMap = isPdf
    ? { version: 1, kind: "pdf", imported: resume, lines }
    : { version: 1, kind: "docx", imported: resume };
  const id = await insertResume(userId, { title, data: resume, isPrimary: used === 0 }, slugify(title));
  try {
    await saveOriginal(userId, id, {
      fileName,
      mimeType: isPdf ? PDF_MIME : DOCX_MIME,
      content: bytes,
      sourceMap,
    });
  } catch (error) {
    await deleteResume(userId, id); // no half-imported resume without its file
    throw error;
  }
  return { ok: true, id, usedAi };
}

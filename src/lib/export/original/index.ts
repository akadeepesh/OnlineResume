import type { SourceMap } from "@/lib/import/source-map";
import { parseResumeDraft } from "@/lib/resume/draft";
import { originalWithSourceMap } from "@/lib/resumes/originals";
import { patchDocx } from "./docx";
import { patchPdf } from "./pdf";
import { textChanges, type PatchPlan } from "./plan";

export type EditedOriginal =
  | { ok: true; file: Uint8Array; fileName: string; mimeType: string; plan: PatchPlan }
  | { ok: false; error: string };

const isSourceMap = (value: unknown): value is SourceMap =>
  typeof value === "object" && value !== null && (value as { version?: unknown }).version === 1;

/** The original file with the resume's edits applied. Owner only. */
export async function buildEditedOriginal(userId: string, resumeId: string): Promise<EditedOriginal> {
  const row = await originalWithSourceMap(userId, resumeId);
  if (!row) return { ok: false, error: "This resume has no original file." };
  if (!isSourceMap(row.sourceMap)) return { ok: false, error: "This original was saved before edits could be applied to it." };

  const imported = parseResumeDraft(row.sourceMap.imported);
  const current = parseResumeDraft(row.data);
  if (!imported.success || !current.success) return { ok: false, error: "This resume's data couldn't be read." };
  const changes = textChanges(imported.data, current.data);

  const result =
    row.sourceMap.kind === "pdf"
      ? await patchPdf(row.content, row.sourceMap.lines, changes)
      : await patchDocx(row.content, changes);
  const fileName = row.fileName.replace(/(\.[a-z]+)$/i, " (edited)$1");
  return { ok: true, file: result.file, fileName, mimeType: row.mimeType, plan: result.plan };
}

import type { Resume } from "@/lib/resume/schema";
import { looksLikeZip } from "@/lib/zip/zip";
import { MAX_IMPORT_BYTES, readResumeJson } from "./files";
import { readLinkedInExport } from "./linkedin";

/** LinkedIn exports with years of messages can be large; we only read a few small CSVs. */
const MAX_ZIP_BYTES = 30 * 1024 * 1024;

export type FileImport = { ok: true; resume: Resume } | { ok: false; error: string };

/** Accepted by the import pickers. */
export const IMPORT_ACCEPT = "application/json,.json,application/zip,.zip";

/**
 * Read a file the user picked: our JSON, JSON Resume, or a LinkedIn export
 * ZIP. Runs in the browser; nothing is uploaded.
 */
export async function readImportFile(file: File): Promise<FileImport> {
  const head = new Uint8Array(await file.slice(0, 4).arrayBuffer());
  if (looksLikeZip(head)) {
    if (file.size > MAX_ZIP_BYTES) return { ok: false, error: "That ZIP is too large (30 MB max)." };
    return readLinkedInExport(new Uint8Array(await file.arrayBuffer()));
  }
  if (file.size > MAX_IMPORT_BYTES) return { ok: false, error: "That file is too large to be a resume (1 MB max)." };
  const result = readResumeJson(await file.text());
  return result.ok ? { ok: true, resume: result.resume } : result;
}

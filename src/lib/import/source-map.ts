import type { Resume } from "@/lib/resume/schema";
import type { PdfLine } from "./pdf";

/**
 * Stored with an imported original (resume_files.source_map). `imported` is
 * the resume exactly as it was read from the file; comparing it with the
 * current resume tells "edited original" export which texts changed. PDFs
 * also keep where each line sits, so changes can be drawn in place.
 */
export type SourceMap =
  | { version: 1; kind: "docx"; imported: Resume }
  | { version: 1; kind: "pdf"; imported: Resume; lines: PdfLine[] };

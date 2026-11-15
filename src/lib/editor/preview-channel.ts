import { parseResumeDraft } from "@/lib/resume/draft";
import type { Resume } from "@/lib/resume/schema";
import { isTemplateSlug, type TemplateSlug } from "@/templates/meta";

// ============================================================================
// Messages between the editor and its preview iframe.
//
// The preview runs in an iframe so templates see a real viewport: their
// breakpoints, `min-h-screen`, fixed and sticky elements and window listeners
// all behave as they do on the public page. The editor posts the draft on
// every change; the iframe says "ready" when it can receive.
// ============================================================================

export const PREVIEW_PATH = "/editor/preview";

export type PreviewReadyMessage = { type: "preview:ready" };
export type PreviewUpdateMessage = {
  type: "preview:update";
  resume: Resume;
  template: TemplateSlug;
};

export const isReadyMessage = (data: unknown): data is PreviewReadyMessage =>
  typeof data === "object" && data !== null && (data as { type?: unknown }).type === "preview:ready";

/**
 * Validate an incoming update. Same-origin only, but still checked: the
 * preview must never crash a template on a malformed message.
 */
export function readUpdateMessage(data: unknown): Omit<PreviewUpdateMessage, "type"> | null {
  if (typeof data !== "object" || data === null) return null;
  const message = data as Partial<Record<keyof PreviewUpdateMessage, unknown>>;
  if (message.type !== "preview:update") return null;
  if (typeof message.template !== "string" || !isTemplateSlug(message.template)) return null;
  const parsed = parseResumeDraft(message.resume);
  if (!parsed.success) return null;
  return { resume: parsed.data, template: message.template };
}

/** Templates expect a name. Show a placeholder while the draft has none. */
export const withPlaceholderName = (resume: Resume): Resume =>
  resume.profile.name.trim()
    ? resume
    : { ...resume, profile: { ...resume.profile, name: "Your Name" } };

import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { ORIGINAL_TYPES, originalForDownload } from "@/lib/resumes/originals";

/**
 * Download a resume's original file. The owner always can; visitors only
 * when the resume is published and the owner allowed downloads. Everyone
 * else gets the same 404, so nothing leaks.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const notFound = () => Response.json({ error: "Not found." }, { status: 404 });
  if (!z.uuid().safeParse(id).success) return notFound();

  const file = await originalForDownload(id);
  if (!file) return notFound();
  const session = await getSession();
  const isOwner = session?.user.id === file.ownerId;
  if (!isOwner && !(file.isPublished && file.allowDownload)) return notFound();

  const type = ORIGINAL_TYPES[file.mimeType];
  if (!type) return notFound(); // never serve a type we didn't intend to store

  const bytes = file.content; // the bytea column type already decodes to bytes
  const ascii = file.fileName.replace(/[^\x20-\x7e]/g, "_").replace(/"/g, "");
  return new Response(bytes as BodyInit, {
    headers: {
      "Content-Type": file.mimeType,
      "Content-Length": String(bytes.length),
      "Content-Disposition": `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(file.fileName)}`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}

import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { buildEditedOriginal } from "@/lib/export/original";
import { allow, TOO_MANY } from "@/lib/rate-limit";

export const runtime = "nodejs";

/** Download the original file with the editor's changes applied. Owner only. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return Response.json({ error: "Sign in to download this." }, { status: 401 });
  if (!z.uuid().safeParse(id).success) return Response.json({ error: "Not found." }, { status: 404 });
  if (!(await allow("export", session.user.id))) return Response.json({ error: TOO_MANY }, { status: 429 });

  const result = await buildEditedOriginal(session.user.id, id);
  if (!result.ok) return Response.json({ error: result.error }, { status: 404 });

  const ascii = result.fileName.replace(/[^\x20-\x7e]/g, "_").replace(/"/g, "");
  return new Response(result.file as BodyInit, {
    headers: {
      "Content-Type": result.mimeType,
      "Content-Disposition": `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(result.fileName)}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

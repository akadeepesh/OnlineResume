import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { importDocument } from "@/lib/import/document";

/** Upload a Word document; creates a resume from it and keeps the original. */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Your session ended. Sign in again." }, { status: 401 });

  let file: FormDataEntryValue | null;
  try {
    file = (await request.formData()).get("file");
  } catch {
    return Response.json({ error: "That upload couldn't be read." }, { status: 400 });
  }
  if (!(file instanceof File)) return Response.json({ error: "Choose a file to upload." }, { status: 400 });

  const result = await importDocument(session.user.id, file);
  if (!result.ok) return Response.json({ error: result.error }, { status: result.status });
  revalidatePath("/dashboard");
  return Response.json({ id: result.id, usedAi: result.usedAi });
}

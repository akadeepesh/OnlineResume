import { exportAccount } from "@/lib/account";
import { getSession } from "@/lib/auth/session";
import { allow, TOO_MANY } from "@/lib/rate-limit";

/** Download everything we store about the signed-in user, as JSON. */
export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: "Not signed in." }, { status: 401 });
  if (!(await allow("export", session.user.id))) return Response.json({ error: TOO_MANY }, { status: 429 });

  const data = await exportAccount(session.user.id);
  const date = new Date().toISOString().slice(0, 10);
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="onlineresume-export-${date}.json"`,
      "Cache-Control": "no-store",
    },
  });
}

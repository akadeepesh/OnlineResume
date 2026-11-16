import { NextResponse } from "next/server";
import { loadVisibleResume } from "@/app/[username]/public-resume";
import { getSession } from "@/lib/auth/session";
import { isServerPdfAvailable, renderPdf } from "@/lib/pdf/render";
import { allow, TOO_MANY } from "@/lib/rate-limit";
import { slugify } from "@/lib/resumes/slug";

export const runtime = "nodejs";
/** Launching Chromium on a cold start takes a few seconds. */
export const maxDuration = 60;

type Params = Promise<{ username: string; slug?: string[] }>;

/**
 * Download a resume as a PDF: /api/pdf/<username>[/<slug>]. Same visibility
 * as the page. Without a server-side Chromium (local development), it sends
 * people to the print page, where the browser saves the PDF instead.
 */
export async function GET(request: Request, { params }: { params: Params }) {
  const { username, slug } = await params;
  if (slug && slug.length > 1) return NextResponse.json({ error: "Not found." }, { status: 404 });
  const visible = await loadVisibleResume(username, slug?.[0] ?? null);
  if (!visible) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const path = new URL(visible.url).pathname;
  const printUrl = new URL(`/print${path}`, request.url);
  if (!isServerPdfAvailable()) {
    printUrl.searchParams.set("auto", "1");
    return NextResponse.redirect(printUrl, 303);
  }

  const session = await getSession();
  const who = session?.user.id ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
  if (!(await allow("pdf", who))) return NextResponse.json({ error: TOO_MANY }, { status: 429 });

  try {
    const pdf = await renderPdf(printUrl.toString(), request.headers.get("cookie"));
    const name = `${slugify(visible.resume.profile.name)}-resume.pdf`;
    return new Response(pdf as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${name}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    // Rendering failed (cold start timeout, missing binary…): the print page still works.
    console.error("PDF rendering failed", error);
    printUrl.searchParams.set("auto", "1");
    return NextResponse.redirect(printUrl, 303);
  }
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getSession } from "@/lib/auth/session";
import { isAuthConfigured } from "@/lib/auth/server";
import { withPlaceholderName } from "@/lib/editor/preview-channel";
import { clientEnv } from "@/lib/env";
import { parseResumeDraft } from "@/lib/resume/draft";
import { publicOriginal } from "@/lib/resumes/originals";
import { findResumeByAddress } from "@/lib/resumes/queries";
import { templates } from "@/templates";
import { isTemplateSlug } from "@/templates/meta";

// ============================================================================
// Shared by /<username> (the primary resume) and /<username>/<slug>.
//
// Published resumes are public. Unpublished ones exist only for their owner,
// who sees them with a "Private" bar; everyone else gets the same 404 as for
// an address that doesn't exist, so nothing leaks (not even in metadata).
// ============================================================================

const ADDRESS_PART = /^[a-z0-9-]{1,60}$/;

const decode = (value: string) => {
  try {
    return decodeURIComponent(value).toLowerCase();
  } catch {
    return ""; // malformed escape: fails the pattern below
  }
};

export type AddressParams = Promise<{ username: string; resume?: string }>;

/** The resume at this address if the current visitor may see it. Cached per request. */
export const loadVisibleResume = cache(async (rawUsername: string, rawSlug: string | null) => {
  const username = decode(rawUsername);
  const slug = rawSlug === null ? null : decode(rawSlug);
  // Cheap rejects (favicon.ico, robots.txt, …) without touching the database.
  if (!ADDRESS_PART.test(username) || (slug !== null && !ADDRESS_PART.test(slug))) return null;
  if (!isAuthConfigured()) return null;

  const found = await findResumeByAddress(username, slug);
  if (!found) return null;
  const session = await getSession();
  const isOwner = session?.user.id === found.resume.userId;
  if (!found.resume.isPublished && !isOwner) return null;

  const parsed = parseResumeDraft(found.resume.data);
  if (!parsed.success) return null;

  const path = slug === null ? `/${username}` : `/${username}/${slug}`;
  return {
    row: found.resume,
    resume: withPlaceholderName(parsed.data),
    isOwner,
    url: new URL(path, clientEnv.NEXT_PUBLIC_SITE_URL).toString(),
  };
});

export async function publicMetadata(username: string, slug: string | null): Promise<Metadata> {
  const visible = await loadVisibleResume(username, slug);
  if (!visible) return { title: "Not found", robots: { index: false, follow: false } };

  const { profile, about } = visible.resume;
  const title = profile.role ? `${profile.name} · ${profile.role}` : profile.name;
  const description = (profile.tagline || about || `${profile.name}'s resume`).slice(0, 200);
  const hidden = visible.row.noindex || !visible.row.isPublished;
  return {
    title,
    description,
    alternates: { canonical: visible.url },
    robots: hidden ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: { title, description, url: visible.url, type: "profile" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export async function PublicResume({ username, slug }: { username: string; slug: string | null }) {
  const visible = await loadVisibleResume(username, slug);
  if (!visible) notFound();

  const { row, resume, isOwner } = visible;
  const Template = templates[isTemplateSlug(row.template) ? row.template : "classic"];
  const printHref = `/print${new URL(visible.url).pathname}?auto=1`;
  const original = row.isPublished ? await publicOriginal(row.id) : null;

  return (
    <>
      <Template data={resume} />
      {isOwner && (
        <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center p-3 print:hidden">
          <div className="flex items-center gap-3 rounded-full border border-neutral-200 bg-white/95 px-4 py-2 text-sm shadow-lg backdrop-blur">
            {row.isPublished ? (
              <span className="text-neutral-600">
                <span className="font-medium text-emerald-700">Published.</span> This is what visitors see.
              </span>
            ) : (
              <span className="text-neutral-600">
                <span className="font-medium text-amber-700">Private.</span> Only you can see this page.
              </span>
            )}
            <Link href={`/editor/${row.id}`} className="font-medium text-neutral-900 underline underline-offset-4">
              Edit
            </Link>
            <a href={printHref} className="font-medium text-neutral-900 underline underline-offset-4">
              PDF
            </a>
          </div>
        </div>
      )}
      {!isOwner && (
        <div className="fixed bottom-4 right-4 z-50 flex gap-2 print:hidden">
          {original && (
            <a
              href={`/api/resumes/${row.id}/original`}
              className="rounded-full border border-neutral-200 bg-white/95 px-4 py-2 text-sm font-medium text-neutral-800 shadow-lg backdrop-blur hover:bg-white"
            >
              Original file
            </a>
          )}
          <a
            href={printHref}
            className="rounded-full border border-neutral-200 bg-white/95 px-4 py-2 text-sm font-medium text-neutral-800 shadow-lg backdrop-blur hover:bg-white"
          >
            Download PDF
          </a>
        </div>
      )}
    </>
  );
}

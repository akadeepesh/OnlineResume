import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import CloudEditor from "@/components/editor/CloudEditor";
import { requireOnboarded } from "@/lib/auth/session";
import { clientEnv } from "@/lib/env";
import { parseResumeDraft } from "@/lib/resume/draft";
import { originalInfo } from "@/lib/resumes/originals";
import { getOwnedResume } from "@/lib/resumes/queries";
import { isTemplateSlug } from "@/templates/meta";

export const metadata: Metadata = {
  title: "Resume editor",
  robots: { index: false, follow: false },
};

export default async function ResumeEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, username } = await requireOnboarded(`/editor/${id}`);
  if (!z.uuid().safeParse(id).success) notFound();

  // Owner-scoped: someone else's id is simply not found.
  const row = await getOwnedResume(user.id, id);
  if (!row) notFound();

  const original = await originalInfo(user.id, row.id);
  const parsed = parseResumeDraft(row.data);
  if (!parsed.success) {
    return (
      <main className="mx-auto max-w-lg px-6 py-24 text-center">
        <h1 className="text-xl font-semibold text-neutral-900">This resume couldn&apos;t be opened</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Its saved data doesn&apos;t match what the editor expects. Nothing was changed.
        </p>
        <Link href="/dashboard" className="mt-6 inline-block text-sm font-medium underline underline-offset-4">
          Back to dashboard
        </Link>
      </main>
    );
  }

  return (
    <CloudEditor
      key={row.id}
      id={row.id}
      title={row.title}
      resume={parsed.data}
      template={isTemplateSlug(row.template) ? row.template : "classic"}
      updatedAt={row.updatedAt.toISOString()}
      share={{
        url: new URL(row.isPrimary ? `/${username}` : `/${username}/${row.slug}`, clientEnv.NEXT_PUBLIC_SITE_URL).toString(),
        isPublished: row.isPublished,
        noindex: row.noindex,
        original: original ?? undefined,
      }}
    />
  );
}

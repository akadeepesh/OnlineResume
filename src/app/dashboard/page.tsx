import type { Metadata } from "next";
import AppHeader from "@/components/AppHeader";
import GuestDraftImport from "@/components/dashboard/GuestDraftImport";
import ResumeList, { type ResumeCard } from "@/components/dashboard/ResumeList";
import { requireOnboarded } from "@/lib/auth/session";
import { clientEnv, serverEnv } from "@/lib/env";
import { editedLabel } from "@/lib/resumes/format";
import { originalNames } from "@/lib/resumes/originals";
import { listResumes, resumeQuota } from "@/lib/resumes/queries";
import { templateMeta } from "@/templates/meta";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

const templateName = (slug: string) => templateMeta.find((t) => t.slug === slug)?.name ?? slug;

export default async function DashboardPage() {
  const { user, username } = await requireOnboarded("/dashboard");
  const [rows, quota] = await Promise.all([listResumes(user.id), resumeQuota(user.id)]);
  const baseLink = `${new URL(clientEnv.NEXT_PUBLIC_SITE_URL).host}/${username}`;
  const originals = await originalNames(
    user.id,
    rows.map((row) => row.id),
  );

  const now = new Date();
  const resumes: ResumeCard[] = rows.map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    templateName: templateName(row.template),
    isPrimary: row.isPrimary,
    isPublished: row.isPublished,
    edited: editedLabel(row.updatedAt, now),
    originalName: originals.get(row.id),
  }));

  return (
    <div className="min-h-screen bg-neutral-50">
      <AppHeader email={user.email} current="dashboard" />

      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Hi, {user.name}</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Your primary resume is at <span className="font-medium text-neutral-900">{baseLink}</span>.
        </p>

        <div className="mt-8">
          <GuestDraftImport />
        </div>

        <div className="mt-8">
          <ResumeList
            resumes={resumes}
            quota={quota}
            baseLink={baseLink}
            username={username}
            aiEnabled={Boolean(serverEnv().GROQ_API_KEY)}
          />
        </div>
      </main>
    </div>
  );
}

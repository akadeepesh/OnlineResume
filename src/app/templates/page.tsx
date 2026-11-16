import type { Metadata } from "next";
import { SiteFooter, SiteNav } from "@/components/marketing/SiteChrome";
import TemplateGallery from "@/components/marketing/TemplateGallery";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Templates",
  description: "Resume templates for OnlineResume, from print-ready to interactive. Preview each with sample data.",
};

export default async function TemplatesPage() {
  const session = await getSession();
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <SiteNav signedIn={session !== null} />
      <main className="mx-auto max-w-6xl px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">Templates</h1>
        <p className="mt-2 max-w-xl text-neutral-600">
          Every template reads the same resume, so you can switch designs without rewriting anything. Previews use a
          fictional sample.
        </p>
        <div className="mt-10">
          <TemplateGallery />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

import { ArrowRight, Download, EyeOff, FileJson, Link2, Lock, Palette, PencilLine, Undo2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteNav } from "@/components/marketing/SiteChrome";
import TemplateGallery from "@/components/marketing/TemplateGallery";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth/session";
import { clientEnv } from "@/lib/env";

export const metadata: Metadata = {
  title: { absolute: "OnlineResume · Your resume, as a link" },
  description:
    "Write your resume once, pick a design, and share one link that always shows the latest version. Download a clean PDF whenever someone asks.",
};

const STEPS = [
  { icon: PencilLine, title: "Write or import", text: "Fill in one section at a time, or import a JSON Resume file." },
  { icon: Palette, title: "Pick a design", text: "Six templates, from print-ready to interactive. Switch any time." },
  { icon: Link2, title: "Share your link", text: "Publish when you're ready. One link, always up to date." },
];

const FEATURES = [
  { icon: Lock, title: "Private until you publish", text: "Unpublished resumes show “not found” to everyone but you." },
  { icon: EyeOff, title: "Hidden from search by default", text: "Search engines only list your page if you turn it on." },
  { icon: Download, title: "ATS-friendly PDF", text: "A clean, single-column PDF for job applications." },
  { icon: FileJson, title: "Your data, portable", text: "Export as JSON or JSON Resume. Import it anywhere." },
  { icon: Undo2, title: "Undo and autosave", text: "Every change is saved as you type, and undo goes back step by step." },
  { icon: Link2, title: "Several resumes, one name", text: "Keep a resume per role, each with its own link." },
];

export default async function Home({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [session, params] = await Promise.all([getSession(), searchParams]);
  const host = new URL(clientEnv.NEXT_PUBLIC_SITE_URL).host;

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <SiteNav signedIn={session !== null} />

      {params.deleted === "1" && (
        <p role="status" className="bg-emerald-50 px-6 py-3 text-center text-sm text-emerald-800">
          Your account and all its data were deleted.
        </p>
      )}

      <main>
        <section className="mx-auto max-w-6xl px-6 pb-16 pt-20 text-center sm:pt-28">
          <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-sm text-neutral-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
            {host}/<span className="font-medium text-neutral-900">yourname</span>
          </p>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
            Your resume, as a link.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-neutral-600">
            Write it once, pick a design, and share one link that always shows your latest version. Download a clean
            PDF whenever someone asks for a file.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href={session ? "/dashboard" : "/sign-up"}>
                {session ? "Go to your resumes" : "Create your resume"}
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/editor">Try it without an account</Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-neutral-500">Free. No credit card. Sign in with email, Google or GitHub.</p>
        </section>

        <section className="border-y border-neutral-200 bg-white" aria-labelledby="how">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h2 id="how" className="sr-only">
              How it works
            </h2>
            <ol className="grid gap-8 sm:grid-cols-3">
              {STEPS.map(({ icon: Icon, title, text }, i) => (
                <li key={title}>
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <p className="mt-4 text-sm font-medium text-neutral-400">Step {i + 1}</p>
                  <h3 className="mt-1 text-lg font-semibold">{title}</h3>
                  <p className="mt-1 text-neutral-600">{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-20" aria-labelledby="templates">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="templates" className="text-2xl font-semibold tracking-tight sm:text-3xl">
                One resume, many looks
              </h2>
              <p className="mt-2 text-neutral-600">Every template reads the same content. Open one to see it live.</p>
            </div>
            <Link href="/templates" className="text-sm font-medium text-neutral-900 underline underline-offset-4">
              All templates
            </Link>
          </div>
          <div className="mt-8">
            <TemplateGallery />
          </div>
        </section>

        <section className="border-t border-neutral-200 bg-white" aria-labelledby="features">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <h2 id="features" className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Built for sharing, careful by default
            </h2>
            <ul className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-4">
                  <Icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" aria-hidden />
                  <div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="mt-1 text-neutral-600">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-20 text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Ready when you are.</h2>
          <p className="mx-auto mt-3 max-w-md text-neutral-600">
            Start writing now. Your draft is kept in this browser until you decide to save it.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/editor">Open the editor</Link>
            </Button>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadVisibleResume } from "@/app/[username]/public-resume";
import PrintToolbar from "@/components/print/PrintToolbar";
import { templates } from "@/templates";
import { isTemplateSlug, printTemplateFor } from "@/templates/meta";

export const metadata: Metadata = {
  title: "Print resume",
  robots: { index: false, follow: false },
};

type Params = Promise<{ username: string; slug?: string[] }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/**
 * Printable version of a public resume: /print/<username>[/<slug>].
 * Same visibility as the page itself (published, or the owner). Uses the
 * resume's template when it prints well, Plain otherwise.
 */
export default async function PrintPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const { username, slug } = await params;
  if (slug && slug.length > 1) notFound();
  const visible = await loadVisibleResume(username, slug?.[0] ?? null);
  if (!visible) notFound();

  const template = printTemplateFor(isTemplateSlug(visible.row.template) ? visible.row.template : "plain");
  const Template = templates[template];
  const backHref = new URL(visible.url).pathname;

  return (
    <>
      <style>{"@page { size: auto; margin: 14mm 12mm; } @media print { html, body { background: #fff; } }"}</style>
      <PrintToolbar backHref={backHref} autoPrint={(await searchParams).auto === "1"} />
      <Template data={visible.resume} />
    </>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ResumePage from "@/components/ResumePage";
import { profile } from "@/data/resume";
import { isTemplateSlug, templateMeta } from "@/templates/meta";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return templateMeta.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const meta = templateMeta.find((t) => t.slug === slug);
  return { title: meta ? `${profile.name} · ${meta.name}` : profile.name };
}

export default async function TemplatePreview({ params }: Props) {
  const { slug } = await params;
  if (!isTemplateSlug(slug)) notFound();
  return <ResumePage template={slug} />;
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ResumePage from "@/components/ResumePage";
import { isTemplateSlug, templateMeta } from "@/templates/meta";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return templateMeta.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const meta = templateMeta.find((t) => t.slug === slug);
  return {
    title: meta ? `${meta.name} template` : "Template",
    description: meta ? `${meta.description}. Preview with sample data.` : undefined,
  };
}

export default async function TemplatePreview({ params }: Props) {
  const { slug } = await params;
  if (!isTemplateSlug(slug)) notFound();
  return <ResumePage template={slug} />;
}

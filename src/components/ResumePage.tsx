import { sampleResume } from "@/lib/resume/sample";
import { templates, type TemplateSlug } from "@/templates";
import TemplateSwitcher from "./TemplateSwitcher";

export default function ResumePage({ template }: { template: TemplateSlug }) {
  const Template = templates[template];
  return (
    <>
      <Template data={sampleResume} />
      <TemplateSwitcher current={template} />
    </>
  );
}

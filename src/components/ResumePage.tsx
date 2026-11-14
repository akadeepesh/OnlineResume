import { sampleResume } from "@/lib/resume/sample";
import { siteConfig } from "@/config/site";
import { templates, type TemplateSlug } from "@/templates";
import TemplateSwitcher from "./TemplateSwitcher";

export default function ResumePage({ template }: { template: TemplateSlug }) {
  const Template = templates[template];
  return (
    <>
      <Template data={sampleResume} />
      {siteConfig.showTemplateSwitcher && <TemplateSwitcher current={template} />}
    </>
  );
}

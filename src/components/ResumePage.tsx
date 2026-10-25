import { resume } from "@/data/resume";
import { siteConfig } from "@/config/site";
import { templates, type TemplateSlug } from "@/templates";
import TemplateSwitcher from "./TemplateSwitcher";

export default function ResumePage({ template }: { template: TemplateSlug }) {
  const Template = templates[template];
  return (
    <>
      <Template data={resume} />
      {siteConfig.showTemplateSwitcher && <TemplateSwitcher current={template} />}
    </>
  );
}

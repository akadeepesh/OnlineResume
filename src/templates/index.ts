import type { ComponentType } from "react";
import type { Resume } from "@/data/resume";
import type { TemplateSlug } from "./meta";
import ClassicTemplate from "./classic/ClassicTemplate";
import EditorialTemplate from "./editorial/EditorialTemplate";
import SpotlightTemplate from "./spotlight/SpotlightTemplate";
import TerminalTemplate from "./terminal/TerminalTemplate";
import BentoTemplate from "./bento/BentoTemplate";

export { templateMeta, isTemplateSlug } from "./meta";
export type { TemplateSlug } from "./meta";

export const templates: Record<TemplateSlug, ComponentType<{ data: Resume }>> = {
  classic: ClassicTemplate,
  editorial: EditorialTemplate,
  spotlight: SpotlightTemplate,
  terminal: TerminalTemplate,
  bento: BentoTemplate,
};

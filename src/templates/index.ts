import { createElement, type ComponentType } from "react";
import type { Resume } from "@/lib/resume/schema";
import { visibleResume } from "@/lib/resume/view";
import type { TemplateSlug } from "./meta";
import ClassicTemplate from "./classic/ClassicTemplate";
import EditorialTemplate from "./editorial/EditorialTemplate";
import SpotlightTemplate from "./spotlight/SpotlightTemplate";
import TerminalTemplate from "./terminal/TerminalTemplate";
import BentoTemplate from "./bento/BentoTemplate";
import PlainTemplate from "./plain/PlainTemplate";

export { templateMeta, isTemplateSlug, printTemplateFor } from "./meta";
export type { TemplateSlug } from "./meta";

type TemplateComponent = ComponentType<{ data: Resume }>;

/**
 * Every template renders through `visibleResume`, so empty items from the
 * editor (just added, nothing typed yet) and blank bullets never reach them.
 */
function showingVisibleContent(Template: TemplateComponent, name: string): TemplateComponent {
  const Wrapped = ({ data }: { data: Resume }) => createElement(Template, { data: visibleResume(data) });
  Wrapped.displayName = name;
  return Wrapped;
}

export const templates: Record<TemplateSlug, TemplateComponent> = {
  classic: showingVisibleContent(ClassicTemplate, "ClassicTemplate"),
  editorial: showingVisibleContent(EditorialTemplate, "EditorialTemplate"),
  spotlight: showingVisibleContent(SpotlightTemplate, "SpotlightTemplate"),
  terminal: showingVisibleContent(TerminalTemplate, "TerminalTemplate"),
  bento: showingVisibleContent(BentoTemplate, "BentoTemplate"),
  plain: showingVisibleContent(PlainTemplate, "PlainTemplate"),
};

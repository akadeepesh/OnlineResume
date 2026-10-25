import { isTemplateSlug, type TemplateSlug } from "@/templates/meta";

const envTemplate = process.env.NEXT_PUBLIC_TEMPLATE ?? "";

export const siteConfig: {
  /** Template rendered at "/" — one of: classic, editorial, spotlight, terminal, bento */
  template: TemplateSlug;
  /**
   * Shows the floating template picker so you (or visitors) can preview every
   * design at /templates/<slug>. Turn this off once you've picked one.
   */
  showTemplateSwitcher: boolean;
} = {
  template: isTemplateSlug(envTemplate) ? envTemplate : "classic",
  showTemplateSwitcher:
    process.env.NEXT_PUBLIC_SHOW_TEMPLATE_SWITCHER !== "false",
};

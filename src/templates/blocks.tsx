import { Fragment, type ReactNode } from "react";
import type { Resume, SectionKey } from "@/lib/resume/schema";
import { arrangeBlocks } from "@/lib/resume/view";

/** One block of a template's layout, and the resume sections it shows. */
export interface Block {
  id: string;
  sections: readonly SectionKey[];
  render: (position: number) => ReactNode;
}

/**
 * Render blocks in the person's section order. Pass `false` for a block with
 * nothing to show (`show.about && {...}`). `position` counts rendered blocks,
 * for things like Editorial's roman numerals or "no top margin on the first".
 */
export function renderBlocks(resume: Resume, blocks: readonly (Block | false)[]): ReactNode {
  const present = blocks.filter((block): block is Block => block !== false);
  return arrangeBlocks(resume, present).map((block, position) => (
    <Fragment key={block.id}>{block.render(position)}</Fragment>
  ));
}

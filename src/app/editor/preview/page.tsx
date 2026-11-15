import type { Metadata } from "next";
import PreviewFrame from "@/components/editor/PreviewFrame";

export const metadata: Metadata = {
  title: "Preview",
  robots: { index: false, follow: false },
};

/** Loaded inside the editor's iframe; receives the draft via postMessage. */
export default function EditorPreviewPage() {
  return <PreviewFrame />;
}

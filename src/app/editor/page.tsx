import type { Metadata } from "next";
import EditorShell from "@/components/editor/EditorShell";

export const metadata: Metadata = {
  title: "Resume editor",
  description: "Write your resume section by section with a live preview.",
  robots: { index: false, follow: false },
};

export default function EditorPage() {
  return <EditorShell />;
}

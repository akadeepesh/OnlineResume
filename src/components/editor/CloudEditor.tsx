"use client";

import { useState } from "react";
import type { Resume } from "@/lib/resume/schema";
import { createCloudEditorStore, EditorStoreProvider } from "@/lib/store/editor";
import type { TemplateSlug } from "@/templates/meta";
import { createCloudSave } from "./cloud-save";
import EditorShell from "./EditorShell";
import type { ShareSettings } from "./ShareDialog";

interface CloudEditorProps {
  id: string;
  title: string;
  resume: Resume;
  template: TemplateSlug;
  /** ISO time of the version loaded, for conflict checks. */
  updatedAt: string;
  share: ShareSettings;
}

/** The editor for a resume saved in the account. */
export default function CloudEditor({ id, title, resume, template, updatedAt, share }: CloudEditorProps) {
  // Created once per page visit. Navigating to another resume remounts (keyed by id).
  const [store] = useState(() => createCloudEditorStore({ resume, template }));
  const [save] = useState(() => createCloudSave(store, id, updatedAt));

  return (
    <EditorStoreProvider value={store}>
      <EditorShell cloud={{ resumeId: id, save, title, share }} />
    </EditorStoreProvider>
  );
}

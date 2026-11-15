"use client";

import { useEffect, useState } from "react";
import { templates } from "@/templates";
import {
  readUpdateMessage,
  withPlaceholderName,
  type PreviewReadyMessage,
  type PreviewUpdateMessage,
} from "@/lib/editor/preview-channel";

type PreviewState = Omit<PreviewUpdateMessage, "type">;

/**
 * Runs inside the editor's preview iframe. Renders whatever the editor posts,
 * and opens links in a new tab so the preview never navigates away.
 */
export default function PreviewFrame() {
  const [state, setState] = useState<PreviewState | null>(null);

  useEffect(() => {
    const parent = window.parent;
    if (parent === window) return; // opened directly, not in the editor

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== parent) return;
      const update = readUpdateMessage(event.data);
      if (update) setState(update);
    };
    window.addEventListener("message", onMessage);
    parent.postMessage({ type: "preview:ready" } satisfies PreviewReadyMessage, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.("a[href]");
      if (!(link instanceof HTMLAnchorElement)) return;
      const href = link.getAttribute("href") ?? "";
      if (href.startsWith("#")) return; // in-page anchors are fine
      event.preventDefault();
      window.open(link.href, "_blank", "noopener,noreferrer");
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  if (!state) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-6 text-center text-sm text-neutral-500">
        Open the editor to see a live preview here.
      </div>
    );
  }

  const Template = templates[state.template];
  return <Template data={withPlaceholderName(state.resume)} />;
}

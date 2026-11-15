"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Monitor, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { editorStore } from "@/lib/store/editor";
import {
  PREVIEW_PATH,
  isReadyMessage,
  type PreviewUpdateMessage,
} from "@/lib/editor/preview-channel";

const DEVICES = {
  desktop: { width: 1280, label: "Desktop", icon: Monitor },
  mobile: { width: 390, label: "Mobile", icon: Smartphone },
} as const;

type Device = keyof typeof DEVICES;

/** Watch an element's size. */
function useSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, size] as const;
}

/**
 * Live preview. The template renders in an iframe at a real device width and
 * is scaled down to fit, so it lays out exactly as it will on the public page.
 */
export default function PreviewPane({
  defaultDevice = "desktop",
  interactive = true,
}: {
  defaultDevice?: Device;
  /** Turn off pointer events, e.g. while the split handle is being dragged. */
  interactive?: boolean;
}) {
  const [device, setDevice] = useState<Device>(defaultDevice);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [frameRef, frame] = useSize<HTMLDivElement>();

  // Send the draft to the iframe now, whenever it changes, and whenever the
  // iframe (re)loads and says it's ready.
  useEffect(() => {
    const post = () => {
      const target = iframeRef.current?.contentWindow;
      if (!target) return;
      const { resume, template } = editorStore.getState();
      const message: PreviewUpdateMessage = { type: "preview:update", resume, template };
      target.postMessage(message, window.location.origin);
    };
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.source !== iframeRef.current?.contentWindow) return;
      if (isReadyMessage(event.data)) post();
    };
    window.addEventListener("message", onMessage);
    const unsubscribe = editorStore.subscribe((state, prev) => {
      if (state.resume !== prev.resume || state.template !== prev.template) post();
    });
    post();
    return () => {
      window.removeEventListener("message", onMessage);
      unsubscribe();
    };
  }, []);

  const { width: deviceWidth } = DEVICES[device];
  const scale = frame.width > 0 ? Math.min(1, frame.width / deviceWidth) : 1;
  const scaledWidth = deviceWidth * scale;

  return (
    <div className="flex h-full min-h-0 flex-col bg-neutral-100">
      <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-3 py-1.5">
        <span className="text-xs font-medium text-neutral-500">
          Live preview{scale < 1 && ` · ${Math.round(scale * 100)}%`}
        </span>
        <div className="flex rounded-md bg-neutral-100 p-0.5" role="group" aria-label="Preview size">
          {(Object.keys(DEVICES) as Device[]).map((key) => {
            const { label, icon: Icon } = DEVICES[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => setDevice(key)}
                aria-pressed={device === key}
                title={label}
                className={cn(
                  "flex items-center gap-1.5 rounded px-2 py-1 text-xs text-neutral-500 transition-colors",
                  device === key && "bg-white text-neutral-900 shadow-sm",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div ref={frameRef} className="relative min-h-0 flex-1 overflow-hidden">
        {frame.width > 0 && (
          <div
            className="absolute top-0 overflow-hidden bg-white shadow-sm"
            style={{
              width: scaledWidth,
              height: frame.height,
              left: (frame.width - scaledWidth) / 2,
            }}
          >
            <iframe
              ref={iframeRef}
              src={PREVIEW_PATH}
              title="Resume preview"
              className={cn("origin-top-left border-0", !interactive && "pointer-events-none")}
              style={{
                width: deviceWidth,
                height: frame.height / scale,
                transform: `scale(${scale})`,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

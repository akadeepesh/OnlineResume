"use client";

import { Download } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * QR code for the resume's link, for printed CVs, business cards and slides.
 * Made in the browser; nothing is sent anywhere.
 */
export default function QrCode({ url, fileName }: { url: string; fileName: string }) {
  const [image, setImage] = useState<{ url: string; png: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    // High resolution, so it stays sharp when printed.
    void QRCode.toDataURL(url, { width: 1024, margin: 2, errorCorrectionLevel: "M" }).then((png) => {
      if (!cancelled) setImage({ url, png });
    });
    return () => {
      cancelled = true;
    };
  }, [url]);

  const png = image?.url === url ? image.png : null;
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-md border border-neutral-200 bg-white p-1">
        {png ? (
          // eslint-disable-next-line @next/next/no-img-element -- a generated data URL, nothing to optimise
          <img src={png} alt={`QR code for ${url}`} className="h-full w-full" />
        ) : (
          <span className="h-full w-full animate-pulse rounded bg-neutral-100 motion-reduce:animate-none" />
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-neutral-900">QR code</p>
        <p className="text-xs text-neutral-500">For a printed CV, a business card or a slide.</p>
        <Button size="sm" variant="outline" className="mt-2" asChild disabled={!png}>
          <a href={png ?? undefined} download={fileName} aria-disabled={!png}>
            <Download className="mr-2 h-4 w-4" aria-hidden />
            Download PNG
          </a>
        </Button>
      </div>
    </div>
  );
}

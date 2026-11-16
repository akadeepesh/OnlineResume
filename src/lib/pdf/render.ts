// ============================================================================
// One-click PDFs: a headless Chromium opens our own print page and saves it
// as a PDF, so the file matches what "Save as PDF" in a browser would give.
//
// - On Vercel, @sparticuz/chromium provides a Chromium built for serverless.
// - Elsewhere, set CHROME_EXECUTABLE_PATH to a local Chrome to use this path;
//   without it, callers fall back to the browser's print dialog.
// ============================================================================

import { serverEnv } from "@/lib/env";

/** `VERCEL` is set by the platform itself on every deployment. */
export const isServerPdfAvailable = () => Boolean(process.env.VERCEL || serverEnv().CHROME_EXECUTABLE_PATH);

async function launch() {
  const puppeteer = await import("puppeteer-core");
  const local = serverEnv().CHROME_EXECUTABLE_PATH;
  if (local) return puppeteer.launch({ executablePath: local, headless: true });
  const chromium = (await import("@sparticuz/chromium")).default;
  chromium.setGraphicsMode = false; // no WebGL needed for a document
  return puppeteer.launch({
    executablePath: await chromium.executablePath(),
    args: chromium.args,
    headless: true,
  });
}

/**
 * Render a page of this site to PDF. `cookie` is forwarded so an owner can
 * download their unpublished resume; the URL is always our own origin.
 */
export async function renderPdf(url: string, cookie: string | null): Promise<Uint8Array> {
  const browser = await launch();
  try {
    const page = await browser.newPage();
    if (cookie) await page.setExtraHTTPHeaders({ cookie });
    const response = await page.goto(url, { waitUntil: "networkidle0", timeout: 25_000 });
    if (!response?.ok()) throw new Error(`Print page answered ${response?.status() ?? "nothing"}`);
    await page.emulateMediaType("print");
    await page.evaluate(() => document.fonts.ready);
    const pdf = await page.pdf({ format: "A4", printBackground: true, preferCSSPageSize: true });
    return new Uint8Array(pdf);
  } finally {
    await browser.close();
  }
}

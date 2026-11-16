/**
 * Security headers for every response. A full Content-Security-Policy is left
 * out on purpose: the templates rely on inline styles and Next's inline
 * scripts, and a policy that breaks pages is worse than none. `frame-ancestors`
 * still stops other sites from framing ours (clickjacking); the editor's own
 * preview iframe is same-origin, so it keeps working.
 */
const securityHeaders = [
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // Loaded by Node at runtime instead of being bundled (they load files and
  // workers of their own).
  serverExternalPackages: ["pdfjs-dist", "@sparticuz/chromium", "puppeteer-core"],
  // The serverless Chromium is read from disk at runtime; make sure it ships with the PDF route.
  outputFileTracingIncludes: {
    "/api/pdf/**": ["./node_modules/@sparticuz/chromium/bin/**"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;

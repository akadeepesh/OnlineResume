import type { Metadata } from "next";
import "./globals.css";
import { Inter, JetBrains_Mono, Newsreader } from "next/font/google";
import { clientEnv } from "@/lib/env";
import { cn } from "@/lib/utils";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontSerif = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  // Absolute URLs for Open Graph images and canonical links.
  metadataBase: new URL(clientEnv.NEXT_PUBLIC_SITE_URL),
  title: { default: "OnlineResume", template: "%s · OnlineResume" },
  description: "Your resume, as a link. Write it once, pick a design, share one link.",
  applicationName: "OnlineResume",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
          fontSerif.variable,
          fontMono.variable
        )}
      >
        {children}
      </body>
    </html>
  );
}

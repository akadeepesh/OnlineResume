import type { Metadata } from "next";
import "./globals.css";
import { Inter, JetBrains_Mono, Newsreader } from "next/font/google";
import { sampleResume } from "@/lib/resume/sample";

const { profile } = sampleResume;

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
  title: profile.name,
  description: `${profile.name} — ${profile.role}. ${profile.tagline}`,
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

import type { Metadata } from "next";
import { Fraunces, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { FaviconManager } from "@/components/FaviconManager";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AO-AI — Terminal task runner",
  description:
    "Paste JSON from your model, review terminal commands, and stream live output.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${fraunces.variable} ${manrope.variable} ${jetbrains.variable}`}
    >
      <body className="min-h-screen bg-canvas text-ink antialiased">
        <FaviconManager />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://share-your-dock.vercel.app";
const SITE_TITLE = "Share Your Dock — Build a fictional dock you can actually show off";
const SITE_DESCRIPTION =
  "Drag-and-drop a fictional dock with the apps you wish you had, then export a clean PNG to share anywhere. No installs required.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  applicationName: "Share Your Dock",
  authors: [{ name: "crilofer", url: "https://github.com/crilofer" }],
  creator: "crilofer",
  keywords: [
    "macOS dock",
    "windows taskbar",
    "linux dock",
    "desktop dock",
    "dock screenshot",
    "fictional dock",
    "share your dock",
    "icons",
    "mockup",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Share Your Dock",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    creator: "@crilofer",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-dvh flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        {children}
      </body>
    </html>
  );
}

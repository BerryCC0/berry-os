import type { Metadata, Viewport } from "next";

import { Appkit } from "./lib/appkit/appkit";

import { Analytics } from "@vercel/analytics/next"

import "./styles/globals.css";

export const metadata: Metadata = {
  title: "Nouns OS",
  description: "Mac OS 8 emulator built with modern web technologies",
  icons: {
    icon: "/favicon.ico",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Nouns OS",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", // For iPhone X+ notch support
  themeColor: "#FFFFFF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Appkit>
          {children}
        </Appkit>
        <Analytics />
      </body>
    </html>
  );
}

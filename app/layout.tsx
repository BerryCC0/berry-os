import type { Metadata } from "next";

import { Appkit } from "./lib/appkit/appkit";

import { Analytics } from "@vercel/analytics/next"

import "./styles/globals.css";

export const metadata: Metadata = {
  title: "Nouns OS",
  description: "Nouns OS",
  icons: {
    icon: "/favicon.ico",
  },
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

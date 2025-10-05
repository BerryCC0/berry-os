import type { Metadata, Viewport } from "next";

import { Appkit } from "./lib/Appkit/appkit";
import { NounsApolloWrapper } from "./lib/Nouns/Goldsky/NounsApolloWrapper";
import { NeynarProvider } from "./lib/Neynar/NeynarProvider";
import { MiniAppProvider } from "./lib/Farcaster/MiniAppProvider";
import { SolanaProvider } from "./lib/Farcaster/SolanaProvider";

import { Analytics } from "@vercel/analytics/next"

import "./styles/globals.css";

// Farcaster Frame metadata for embeds
const frameMetadata = {
  version: "next",
  imageUrl: "https://berryos.wtf/icons/apps/berry.svg",
  imageAspectRatio: "1:1",
  button: {
    title: "Launch Berry OS",
    action: {
      type: "launch_miniapp",
      name: "Berry OS",
      url: "https://berryos.wtf",
      splashImageUrl: "https://berryos.wtf/icons/apps/berry.svg",
      splashBackgroundColor: "#FFFFFF"
    }
  }
};

export const metadata: Metadata = {
  title: "Berry OS",
  description: "The operating system for Web3, inspired by Nouns.",
  icons: {
    icon: "/favicon.ico",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Berry OS",
  },
  manifest: "/manifest.json",
  other: {
    'fc:frame': JSON.stringify(frameMetadata),
  },
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
        <MiniAppProvider>
          <SolanaProvider>
            <Appkit>
              <NounsApolloWrapper>
                <NeynarProvider>
                  {children}
                </NeynarProvider>
              </NounsApolloWrapper>
            </Appkit>
          </SolanaProvider>
        </MiniAppProvider>
        <Analytics />
      </body>
    </html>
  );
}

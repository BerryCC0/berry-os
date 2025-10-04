import type { Metadata, Viewport } from "next";

import { Appkit } from "./lib/appkit/appkit";
import { ApolloProvider } from "./lib/apollo/ApolloProvider";
import { NeynarProvider } from "./lib/neynar/NeynarProvider";
import { MiniAppProvider } from "./lib/farcaster/MiniAppProvider";
import { SolanaProvider } from "./lib/farcaster/SolanaProvider";

import { Analytics } from "@vercel/analytics/next"

import "./styles/globals.css";

// Farcaster Frame metadata for embeds
const frameMetadata = {
  version: "next",
  imageUrl: "https://nounsos.wtf/icons/apps/berry.svg",
  button: {
    title: "Launch Nouns OS",
    action: {
      type: "launch_miniapp",
      name: "Nouns OS",
      url: "https://nounsos.wtf",
      splashImageUrl: "https://nounsos.wtf/icons/apps/berry.svg",
      splashBackgroundColor: "#FFFFFF"
    }
  }
};

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
              <ApolloProvider>
                <NeynarProvider>
                  {children}
                </NeynarProvider>
              </ApolloProvider>
            </Appkit>
          </SolanaProvider>
        </MiniAppProvider>
        <Analytics />
      </body>
    </html>
  );
}

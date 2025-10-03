import type { Metadata } from "next";
import { Web3Provider } from "./lib/appkit/appkit";
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
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}

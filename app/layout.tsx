import type { Metadata } from "next";
import "./globals.css";
import { pageMetadata, seoOrigin } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(seoOrigin),
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
  },
  ...pageMetadata("/"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}

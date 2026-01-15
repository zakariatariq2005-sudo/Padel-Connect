import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PadelConnect - Connect with Padel Players",
  description: "Find and play padel matches with players around you",
  manifest: "/manifest.json",
  themeColor: "#0B1220",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PadelConnect",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="theme-color" content="#0B1220" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="PadelConnect" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>{children}</body>
    </html>
  );
}

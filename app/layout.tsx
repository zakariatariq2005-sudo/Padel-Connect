import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Impero Sport - Connect with Clay Tennis Players",
  description: "Find and play clay tennis matches with players around you",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}



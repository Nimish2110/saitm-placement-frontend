import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SAITM Placement Portal",
  description: "SAITM Placement Portal — Student & Placement Manager Console",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-surface-2 text-ink">{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ArcNano Verdict // Binary Cryptographic Decision Engine",
  description: "Minimalist binary evaluation with cryptographic reasoning for AI agents on Arc.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen selection:bg-amber-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}

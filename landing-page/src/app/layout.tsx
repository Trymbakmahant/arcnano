import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ArcNano — Shielded Nanopayments For The Autonomous Agent Era",
  description: "Private, compliant, and decoupled machine-to-machine payments via HTTP 402 and Zero-Knowledge proofs on the Arc Network.",
  icons: {
    icon: "/favicon.png",
    apple: "/arcnano-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" data-theme="light">
      <body className="bg-[var(--bg-app)] text-[var(--text-primary)] font-sans antialiased selection:bg-sky-500 selection:text-white transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ArcNano Documentation — Shielded Nanopayments on Arc (docs.arcnano.xyz)",
  description:
    "Official developer documentation for ArcNano: Zero-knowledge Groth16 micropayments, Privacy Pools ASP compliance, sub-8ms HTTP 402 verification, and anti-fraud architecture on Arc (Circle L1).",
  keywords: [
    "ArcNano Docs",
    "docs.arcnano.xyz",
    "Zero-Knowledge Payments",
    "Groth16",
    "Circom 2.1",
    "Arc Network",
    "HTTP 402",
    "Privacy Pools",
    "AI Agent Payments",
    "Anti-Fraud",
    "Double-Spend Prevention"
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}

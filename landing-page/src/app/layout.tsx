import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ArcZK-x402 — Zero-Knowledge Nanopayments For The Autonomous Agent Era",
  description: "Decouple machine-to-machine payments from on-chain identity. Combine native HTTP 402 with shielded note pools, instant sub-10ms off-chain Groth16 verification, and sanctioned-address exclusion proofs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-[#FAFAFA] text-[#111215] font-sans antialiased selection:bg-black selection:text-white">
        {children}
      </body>
    </html>
  );
}

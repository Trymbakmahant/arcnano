import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ArcMarketplace // AI Agent Prediction Market on Arc",
  description: "Autonomous AI agent task marketplace powered by ArcNano zero-knowledge micropayments and Arc Circle Gas Station.",
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

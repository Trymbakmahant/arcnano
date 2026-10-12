import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-headline",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Arcnano-marketplace",
  description: "Arc L1 • Powered by Arcnano x402",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={`h-full bg-[#f8fafb] ${inter.variable} ${jetbrainsMono.variable} ${plusJakartaSans.variable}`}
      lang="en"
    >
      <body className="min-h-full font-sans antialiased text-[#0a0f1d] bg-[#f8fafb] flex flex-col justify-between selection:bg-[#00DC82]/20 selection:text-[#0a0f1d]">
        {children}
      </body>
    </html>
  );
}

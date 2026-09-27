import type { Metadata } from "next";
import { Preloader } from "@/component/UI";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://arcnano.dev";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ArcNano — Shielded Nanopayments For The Autonomous Agent Era",
    template: "%s | ArcNano",
  },
  description:
    "Decoupled, zero-knowledge X402 micropayments for autonomous AI agents on the Arc Network. Zero msg.sender surveillance, Privacy Pools ASP compliance, and sub-8ms verification.",
  keywords: [
    "ArcNano",
    "ArcShield-X402",
    "Arc Network",
    "X402",
    "x402",
    "Zero-Knowledge Proofs",
    "ZK Nanopayments",
    "AI Agent Payments",
    "Autonomous AI Agents",
    "Groth16",
    "Circom",
    "Privacy Pools",
    "Association Set Provider",
    "USDC Micropayments",
    "Circle Gas Station",
    "Machine to Machine Micropayments",
    "Decoupled Signer Settlement",
    "M2M Crypto",
  ],
  authors: [{ name: "Trymbak Mahant", url: "https://github.com/Trymbakmahant" }],
  creator: "Trymbak Mahant",
  publisher: "ArcNano",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
    types: {
      "text/markdown": "/llms.txt",
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/arcnano-icon.png",
  },
  openGraph: {
    title: "ArcNano — Shielded Nanopayments For The Autonomous Agent Era",
    description:
      "Private, compliant, and decoupled machine-to-machine payments via X402 and Zero-Knowledge proofs on Arc.",
    url: siteUrl,
    siteName: "ArcNano",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/arcnano-logo.png",
        width: 1200,
        height: 630,
        alt: "ArcNano Protocol — Shielded Nanopayments",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ArcNano — Shielded Nanopayments For The Autonomous Agent Era",
    description:
      "Private, compliant, and decoupled machine-to-machine payments via X402 and Zero-Knowledge proofs on Arc.",
    images: ["/arcnano-logo.png"],
    creator: "@0xarcnano",
    site: "@0xarcnano",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "technology",
  other: {
    "ai-content-declaration": "LLM-friendly technical documentation available at /llms.txt and /llms-full.txt",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "ArcNano",
      url: siteUrl,
      logo: `${siteUrl}/arcnano-logo.png`,
      sameAs: [
        "https://x.com/0xarcnano",
        "https://github.com/Trymbakmahant/arcnano",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "ArcNano",
      description: "Shielded Nanopayments For The Autonomous AI Agent Era",
      publisher: {
        "@id": `${siteUrl}/#organization`,
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${siteUrl}/#software`,
      name: "ArcNano Protocol (ArcShield-X402)",
      applicationCategory: "BlockchainApplication",
      operatingSystem: "Arc Network, EVM",
      description:
        "Zero-Knowledge X402 micropayment protocol for autonomous AI agents with signer decoupling, Privacy Pools ASP compliance, and sub-8ms off-chain verification.",
      license: "https://opensource.org/licenses/MIT",
      author: {
        "@type": "Person",
        name: "Trymbak Mahant",
        url: "https://github.com/Trymbakmahant",
      },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
    {
      "@type": "TechArticle",
      "@id": `${siteUrl}/#techarticle`,
      headline: "ArcNano: Shielded Nanopayments For The Autonomous Agent Era",
      description:
        "Architectural and cryptographic specification of decoupled, compliant machine-to-machine payments via X402 on the Arc Network.",
      author: {
        "@type": "Person",
        name: "Trymbak Mahant",
        url: "https://github.com/Trymbakmahant",
      },
      publisher: {
        "@id": `${siteUrl}/#organization`,
      },
      mainEntityOfPage: siteUrl,
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" data-theme="light">
      <head>
        <link rel="help" href="/llms.txt" title="LLM Documentation" />
        <link rel="alternate" type="text/markdown" href="/llms.txt" title="ArcNano LLM Context" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-[var(--bg-app)] text-[var(--text-primary)] font-sans antialiased selection:bg-sky-500 selection:text-white transition-colors duration-300">
        <Preloader />
        {children}
      </body>
    </html>
  );
}

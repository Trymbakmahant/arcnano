import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ArcZK-x402 — Zero-Knowledge Nanopayments For The Autonomous Agent Era",
  description: "Decouple machine-to-machine payments from on-chain identity. Combine native HTTP 402 with shielded note pools, instant sub-10ms off-chain Groth16 verification, and sanctioned-address exclusion proofs on Arc.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var isDark = stored === 'dark' || (!stored && prefersDark);
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.setAttribute('data-theme', 'dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.setAttribute('data-theme', 'light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="bg-[var(--bg-app)] text-[var(--text-primary)] font-sans antialiased selection:bg-indigo-500 selection:text-white transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}

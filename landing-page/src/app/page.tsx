import React from "react";
import {
  SpotlightOverlay,
  ArcNanoHero,
  ProtocolMarquee,
  ThreatModelSection,
  ArchitecturalResolution,
  A2APaymentFlow,
  SiteFooter,
} from "@/component/UI";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] font-sans antialiased overflow-x-clip selection:bg-sky-500 selection:text-white">
      {/* High-Performance GPU Cursor Spotlight Overlay (0 React re-renders) */}
      <SpotlightOverlay />

      <main className="relative">
        {/* Section 00: Interactive 3D Hero */}
        <ArcNanoHero />

        {/* Protocol Architecture Marquee Strip */}
        <ProtocolMarquee />

        {/* Section 01: Threat Model & 4 Fatal Traps */}
        <ThreatModelSection />

        {/* Section 02: Architectural Resolution (Curvy Stepper) */}
        <ArchitecturalResolution />

        {/* Section 03: Autonomous P2P Protocol Execution Flow (GSAP ScrollTrigger) */}
        <A2APaymentFlow />
      </main>

      {/* Institutional Precision Footer */}
      <SiteFooter />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const STATUS_MESSAGES = [
  "INITIALIZING ARCNANO PROTOCOL...",
  "LOADING ZK-SNARK CIRCUITS...",
  "VERIFYING X402 SETTLEMENT RAILS...",
  "READY FOR AUTONOMOUS COMMERCE",
];

export default function Preloader() {
  const [loading, setLoading] = useState(true);
  const [fading, setFading] = useState(false);
  const [progress, setProgress] = useState(15);
  const [statusIdx, setStatusIdx] = useState(0);

  useEffect(() => {
    // Lock scroll during initial load
    document.body.style.overflow = "hidden";

    // Smooth progress counter animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        const step = Math.floor(Math.random() * 12) + 10;
        return Math.min(prev + step, 100);
      });
    }, 110);

    // Status message switcher
    const statusInterval = setInterval(() => {
      setStatusIdx((prev) => (prev < STATUS_MESSAGES.length - 1 ? prev + 1 : prev));
    }, 360);

    // Fade-out trigger once loading sequence completes (~1.6s)
    const timeout = setTimeout(() => {
      setFading(true);
      const exitTimer = setTimeout(() => {
        setLoading(false);
        document.body.style.overflow = "";
      }, 700);
      return () => clearTimeout(exitTimer);
    }, 1600);

    return () => {
      clearInterval(progressInterval);
      clearInterval(statusInterval);
      clearTimeout(timeout);
      document.body.style.overflow = "";
    };
  }, []);

  if (!loading) return null;

  return (
    <div
      aria-hidden={fading}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#FAFAFA] transition-all duration-700 ease-out select-none ${
        fading ? "opacity-0 scale-[1.02] pointer-events-none" : "opacity-100 scale-100"
      }`}
    >
      {/* Background Architectural Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#d4d4d8_1px,transparent_1px)] [background-size:24px_24px] opacity-70 pointer-events-none" />

      {/* Subtle Ambient Radial Glow */}
      <div className="absolute w-[440px] h-[440px] rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

      {/* Architectural Corner Telemetry Markers */}
      <div className="absolute top-6 left-6 text-[10px] font-mono text-neutral-400 tracking-wider hidden sm:block">
        [SYS.BOOT // ARCNANO-CORE]
      </div>
      <div className="absolute top-6 right-6 text-[10px] font-mono text-neutral-400 tracking-wider hidden sm:block">
        [NET: ARC // X402]
      </div>
      <div className="absolute bottom-6 left-6 text-[10px] font-mono text-neutral-400 tracking-wider hidden sm:block">
        [ZK: GROTH16_BN254]
      </div>
      <div className="absolute bottom-6 right-6 text-[10px] font-mono text-neutral-400 tracking-wider hidden sm:block">
        [STATUS: ONLINE]
      </div>

      {/* Centerpiece Logo & Loading Telemetry */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Emblem Container with Precision Halo */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
          {/* Subtle Outer Ping Wave */}
          <div className="absolute inset-0 rounded-full border border-amber-500/25 animate-ping opacity-25" />

          {/* Precision Rotating Dashed Ring */}
          <div className="absolute inset-1 rounded-full border border-dashed border-neutral-300 animate-spin [animation-duration:12s]" />

          {/* Concentric Accent Ring */}
          <div className="absolute inset-3 rounded-full border border-neutral-200/90" />

          {/* Dark Emblem Badge with White ArcNano Icon */}
          <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-neutral-950 shadow-xl shadow-neutral-950/15 border border-neutral-800 flex items-center justify-center p-3 transition-transform">
            <Image
              src="/arcnano-icon-white.png"
              alt="ArcNano Icon"
              width={40}
              height={40}
              priority
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain"
            />
          </div>
        </div>

        {/* Full ArcNano Brand Logo */}
        <div className="mt-5 flex items-center justify-center">
          <Image
            src="/arcnano-logo.png"
            alt="ArcNano Logo"
            width={240}
            height={42}
            priority
            className="h-7 sm:h-8 w-auto object-contain"
          />
        </div>

        {/* Telemetry Status Line */}
        <div className="mt-5 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-neutral-700 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="min-w-[210px] text-center">{STATUS_MESSAGES[statusIdx]}</span>
            <span className="text-neutral-900 font-bold ml-1">{progress}%</span>
          </div>

          {/* High-Precision Progress Bar */}
          <div className="w-48 sm:w-56 h-[3px] bg-neutral-200/90 rounded-full overflow-hidden relative mt-1">
            <div
              className="h-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 transition-all duration-150 ease-out rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { memo } from "react";
import VerticalCurvyStepper from "./VerticalCurvyStepper";

function ArchitecturalResolution() {
  return (
    <section className="py-24 max-w-7xl mx-auto px-4 relative z-10 overflow-visible" id="solution">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-xs font-mono text-amber-800 mb-4 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span>{"02 // Architectural Resolution"}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-neutral-950">
          How ArcNano Solves Every Trap
        </h2>
        <p className="text-neutral-600 text-base md:text-lg mt-4 leading-relaxed">
          We architected ArcNano from first principles to decouple payments from identity, guarantee legal compliance, and deliver instant sub-second verification.
        </p>
      </div>

      {/* Animated Vertical Curvy Stepper */}
      <VerticalCurvyStepper />
    </section>
  );
}

export default memo(ArchitecturalResolution);

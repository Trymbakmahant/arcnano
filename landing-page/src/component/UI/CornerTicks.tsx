"use client";

import React from "react";

interface CornerTicksProps {
  className?: string;
  color?: string;
  activeColor?: string;
  size?: string;
  strokeWidth?: number;
}

/**
 * Precision Architectural CAD Corner Ticks
 * Renders ┌ (Top-Left), ┐ (Top-Right), └ (Bottom-Left), ┘ (Bottom-Right)
 * matching the technical institutional blueprint design of Section 02.
 */
export default function CornerTicks({
  className = "",
  color = "text-neutral-400",
  activeColor,
  size = "w-4 h-4 sm:w-5 sm:h-5",
  strokeWidth = 2,
}: CornerTicksProps) {
  const strokeClass = activeColor || color;

  return (
    <div className={`pointer-events-none absolute inset-0 z-20 overflow-visible ${className}`}>
      {/* Top-Left Corner ┌ */}
      <svg
        className={`absolute -top-[1px] -left-[1px] ${size} ${strokeClass} transition-colors duration-200`}
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M1 20V1H20"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="square"
        />
      </svg>

      {/* Top-Right Corner ┐ */}
      <svg
        className={`absolute -top-[1px] -right-[1px] ${size} ${strokeClass} transition-colors duration-200`}
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M19 20V1H0"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="square"
        />
      </svg>

      {/* Bottom-Left Corner └ */}
      <svg
        className={`absolute -bottom-[1px] -left-[1px] ${size} ${strokeClass} transition-colors duration-200`}
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M1 0V19H20"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="square"
        />
      </svg>

      {/* Bottom-Right Corner ┘ */}
      <svg
        className={`absolute -bottom-[1px] -right-[1px] ${size} ${strokeClass} transition-colors duration-200`}
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M19 0V19H0"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="square"
        />
      </svg>
    </div>
  );
}

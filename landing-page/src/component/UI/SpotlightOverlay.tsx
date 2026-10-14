"use client";

import React, { useEffect, useRef } from "react";

/**
 * Ultra-high-performance Spotlight Overlay.
 * Uses direct DOM manipulation via requestAnimationFrame instead of React state,
 * preventing full-page re-renders on mousemove for 120fps smoothness.
 */
export default function SpotlightOverlay() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    let mouseX = -1000;
    let mouseY = -1000;

    const handlePointerMove = (e: PointerEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!rafId.current) {
        rafId.current = requestAnimationFrame(() => {
          if (overlayRef.current) {
            overlayRef.current.style.background = `radial-gradient(650px circle at ${mouseX}px ${mouseY}px, var(--spotlight-color), transparent 75%)`;
          }
          rafId.current = null;
        });
      }
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <div
      ref={overlayRef}
      className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300 will-change-[background]"
      aria-hidden="true"
    />
  );
}

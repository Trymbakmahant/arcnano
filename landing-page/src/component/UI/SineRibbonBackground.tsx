"use client";

import React, { useEffect, useRef } from "react";

export interface SineRibbonBackgroundProps {
  className?: string;
  palette?: "arc" | "emerald" | "violet" | "aurora";
  speed?: number;
  interactive?: boolean;
  opacity?: number;
  showOverlayGlow?: boolean;
  transparentBg?: boolean;
}

interface Harmonic {
  freq: number;
  amp: number;
  speed: number;
}

interface RibbonConfig {
  baseY: number; // percentage of canvas height (0-1)
  thickness: number; // base thickness in px
  amp: number;
  speed: number;
  freq: number;
  phase: number;
  harmonics: Harmonic[];
  colorStart: string;
  colorMid: string;
  colorEnd: string;
  edgeColor: string;
  lineWidth: number;
}

export default function SineRibbonBackground({
  className = "w-full h-full absolute inset-0",
  palette = "arc",
  speed = 1.0,
  interactive = true,
  opacity = 1.0,
  showOverlayGlow = true,
  transparentBg = false,
}: SineRibbonBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Smooth mouse tracking with inertia & dampening
  const mouseState = useRef({
    x: -3000,
    y: -3000,
    targetX: -3000,
    targetY: -3000,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId: number;
    let animTime = 0;
    let lastTime = performance.now();

    // Helper to get actual available CSS dimensions
    const getContainerSize = () => {
      const rect = container.getBoundingClientRect();
      const parentRect = container.parentElement?.getBoundingClientRect();

      const w =
        rect.width ||
        container.clientWidth ||
        parentRect?.width ||
        (typeof window !== "undefined" ? window.innerWidth : 1200);

      const h =
        rect.height ||
        container.clientHeight ||
        parentRect?.height ||
        (typeof window !== "undefined" ? window.innerHeight : 600);

      return { width: Math.max(w, 320), height: Math.max(h, 200) };
    };

    // Update physical canvas buffer dimensions
    const updateCanvasBuffer = (w?: number, h?: number) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const dims = w && h ? { width: w, height: h } : getContainerSize();
      const pixelWidth = Math.floor(dims.width * dpr);
      const pixelHeight = Math.floor(dims.height * dpr);

      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
      }
    };

    // Initialize dimensions immediately
    updateCanvasBuffer();

    // Use ResizeObserver on container to handle dynamic layouts
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          if (width > 0 && height > 0) {
            updateCanvasBuffer(width, height);
          }
        }
      });
      ro.observe(container);
      if (container.parentElement) {
        ro.observe(container.parentElement);
      }
    }

    const onWindowResize = () => {
      updateCanvasBuffer();
    };
    window.addEventListener("resize", onWindowResize);

    // Cryptographic palettes for Arc Network & Zero-Knowledge themes
    const getRibbons = (theme: string): RibbonConfig[] => {
      switch (theme) {
        case "emerald":
          return [
            {
              baseY: 0.50,
              thickness: 75,
              speed: 0.015 * speed,
              amp: 65,
              freq: 0.0028,
              phase: 0.2,
              harmonics: [
                { freq: 0.0055, amp: 26, speed: 0.02 * speed },
                { freq: 0.011, amp: 12, speed: -0.012 * speed },
              ],
              colorStart: "rgba(52, 211, 153, 0.55)", // Emerald 400
              colorMid: "rgba(16, 185, 129, 0.40)",   // Emerald 500
              colorEnd: "rgba(5, 150, 105, 0.12)",   // Emerald 600
              edgeColor: "rgba(167, 243, 208, 0.95)", // Emerald 200 Crest
              lineWidth: 2.2,
            },
            {
              baseY: 0.58,
              thickness: 90,
              speed: 0.012 * speed,
              amp: 80,
              freq: 0.0022,
              phase: 2.1,
              harmonics: [
                { freq: 0.0048, amp: 32, speed: -0.014 * speed },
                { freq: 0.009, amp: 15, speed: 0.018 * speed },
              ],
              colorStart: "rgba(16, 185, 129, 0.50)",
              colorMid: "rgba(6, 95, 70, 0.35)",
              colorEnd: "rgba(4, 120, 87, 0.08)",
              edgeColor: "rgba(255, 255, 255, 0.95)",
              lineWidth: 2.0,
            },
            {
              baseY: 0.44,
              thickness: 60,
              speed: 0.022 * speed,
              amp: 52,
              freq: 0.0038,
              phase: 4.0,
              harmonics: [
                { freq: 0.0075, amp: 22, speed: 0.025 * speed },
                { freq: 0.014, amp: 9, speed: -0.016 * speed },
              ],
              colorStart: "rgba(110, 231, 183, 0.48)",
              colorMid: "rgba(52, 211, 153, 0.28)",
              colorEnd: "rgba(4, 120, 87, 0.06)",
              edgeColor: "rgba(209, 250, 229, 0.95)",
              lineWidth: 1.8,
            },
          ];

        case "violet":
          return [
            {
              baseY: 0.52,
              thickness: 80,
              speed: 0.013 * speed,
              amp: 70,
              freq: 0.0026,
              phase: 0.5,
              harmonics: [
                { freq: 0.0055, amp: 30, speed: 0.018 * speed },
                { freq: 0.012, amp: 14, speed: -0.011 * speed },
              ],
              colorStart: "rgba(192, 132, 252, 0.55)", // Purple 400
              colorMid: "rgba(147, 51, 234, 0.38)",   // Purple 600
              colorEnd: "rgba(88, 28, 135, 0.10)",   // Deep Violet
              edgeColor: "rgba(243, 232, 255, 0.98)", // Specular Crest
              lineWidth: 2.2,
            },
            {
              baseY: 0.60,
              thickness: 95,
              speed: 0.011 * speed,
              amp: 85,
              freq: 0.002,
              phase: 2.8,
              harmonics: [
                { freq: 0.0045, amp: 35, speed: -0.013 * speed },
                { freq: 0.0085, amp: 18, speed: 0.02 * speed },
              ],
              colorStart: "rgba(168, 85, 247, 0.48)",
              colorMid: "rgba(126, 34, 206, 0.30)",
              colorEnd: "rgba(59, 7, 100, 0.07)",
              edgeColor: "rgba(255, 255, 255, 0.95)",
              lineWidth: 2.0,
            },
          ];

        case "arc":
        default:
          // Arc Signature: Radiant Sky Blue, ZK Shielded Emerald, and Settlement Indigo
          return [
            // Ribbon 1: Arc Blue / Sky Cyan Wave
            {
              baseY: 0.52,
              thickness: 82,
              speed: 0.014 * speed,
              amp: 72,
              freq: 0.0025,
              phase: 0.0,
              harmonics: [
                { freq: 0.0052, amp: 30, speed: 0.019 * speed },
                { freq: 0.0105, amp: 14, speed: -0.012 * speed },
              ],
              colorStart: "rgba(56, 189, 248, 0.60)", // Sky 400
              colorMid: "rgba(2, 132, 199, 0.40)",    // Sky 600
              colorEnd: "rgba(14, 116, 144, 0.10)",  // Cyan 700
              edgeColor: "rgba(224, 242, 254, 1.0)",  // Pure Specular Sky
              lineWidth: 2.4,
            },
            // Ribbon 2: ZK Shielded Emerald Proof Stream
            {
              baseY: 0.46,
              thickness: 95,
              speed: 0.017 * speed,
              amp: 86,
              freq: 0.0021,
              phase: 1.8,
              harmonics: [
                { freq: 0.0042, amp: 38, speed: -0.014 * speed },
                { freq: 0.0085, amp: 19, speed: 0.022 * speed },
              ],
              colorStart: "rgba(52, 211, 153, 0.55)", // Emerald 400
              colorMid: "rgba(16, 185, 129, 0.38)",  // Emerald 500
              colorEnd: "rgba(6, 78, 59, 0.09)",     // Deep Emerald
              edgeColor: "rgba(255, 255, 255, 0.98)", // Pure White Crest
              lineWidth: 2.2,
            },
            // Ribbon 3: Gas Station Indigo Stream
            {
              baseY: 0.62,
              thickness: 100,
              speed: 0.011 * speed,
              amp: 78,
              freq: 0.0019,
              phase: 3.4,
              harmonics: [
                { freq: 0.0038, amp: 34, speed: 0.013 * speed },
                { freq: 0.0078, amp: 18, speed: -0.01 * speed },
              ],
              colorStart: "rgba(129, 140, 248, 0.52)", // Indigo 400
              colorMid: "rgba(79, 70, 229, 0.35)",    // Indigo 600
              colorEnd: "rgba(30, 27, 75, 0.08)",    // Deep Indigo
              edgeColor: "rgba(224, 231, 255, 0.95)", // Indigo Crest
              lineWidth: 2.0,
            },
            // Ribbon 4: High-frequency Violet Harmonic Stream
            {
              baseY: 0.38,
              thickness: 60,
              speed: 0.021 * speed,
              amp: 54,
              freq: 0.0032,
              phase: 4.6,
              harmonics: [
                { freq: 0.0068, amp: 24, speed: 0.024 * speed },
                { freq: 0.0125, amp: 11, speed: -0.016 * speed },
              ],
              colorStart: "rgba(168, 85, 247, 0.48)", // Purple 500
              colorMid: "rgba(139, 92, 246, 0.32)",  // Violet 500
              colorEnd: "rgba(88, 28, 135, 0.07)",   // Deep Violet
              edgeColor: "rgba(245, 243, 255, 0.92)", // Violet Crest
              lineWidth: 1.8,
            },
            // Ribbon 5: Luminous Center Crest Specular Line
            {
              baseY: 0.50,
              thickness: 48,
              speed: 0.026 * speed,
              amp: 46,
              freq: 0.004,
              phase: 2.3,
              harmonics: [
                { freq: 0.008, amp: 20, speed: -0.02 * speed },
                { freq: 0.0145, amp: 9, speed: 0.026 * speed },
              ],
              colorStart: "rgba(255, 255, 255, 0.45)",
              colorMid: "rgba(199, 210, 254, 0.28)",
              colorEnd: "rgba(147, 197, 253, 0.07)",
              edgeColor: "rgba(255, 255, 255, 1.0)",
              lineWidth: 1.6,
            },
          ];
      }
    };

    const ribbons = getRibbons(palette);

    // Global window mouse move for effortless cursor ripple physics
    const onMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      // Test if mouse is near or inside container
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (x >= -200 && x <= rect.width + 200 && y >= -200 && y <= rect.height + 200) {
        mouseState.current.targetX = x;
        mouseState.current.targetY = y;
      } else {
        mouseState.current.targetX = -3000;
        mouseState.current.targetY = -3000;
      }
    };

    const onMouseLeave = () => {
      mouseState.current.targetX = -3000;
      mouseState.current.targetY = -3000;
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mouseout", onMouseLeave);

    // Wave height calculation with multi-harmonic curves & mouse repulsion
    const computeWaveY = (
      x: number,
      ribbon: RibbonConfig,
      t: number,
      w: number,
      h: number
    ): number => {
      const baseY = h * ribbon.baseY;
      let wave = Math.sin(x * ribbon.freq + t * ribbon.speed + ribbon.phase) * ribbon.amp;

      for (let i = 0; i < ribbon.harmonics.length; i++) {
        const hrm = ribbon.harmonics[i];
        wave += Math.sin(x * hrm.freq + t * hrm.speed) * hrm.amp;
      }

      // Interactive mouse ripple physics
      if (interactive) {
        const mx = mouseState.current.x;
        const my = mouseState.current.y;
        if (mx > -1500) {
          const dx = x - mx;
          const dy = baseY - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxRadius = 300;

          if (dist < maxRadius) {
            const factor = Math.pow(1 - dist / maxRadius, 2.0);
            const ripple = Math.sin(dist * 0.06 - t * 0.1) * (factor * 42);
            wave += ripple;
          }
        }
      }

      return baseY + wave;
    };

    // Render loop
    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      animTime += dt * 60;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      let w = canvas.width / dpr;
      let h = canvas.height / dpr;

      // Safety check: if canvas has not yet acquired proper dimensions, update buffer
      if (w <= 0 || h <= 0) {
        const dims = getContainerSize();
        if (dims.width > 0 && dims.height > 0) {
          updateCanvasBuffer(dims.width, dims.height);
          w = dims.width;
          h = dims.height;
        } else {
          animId = requestAnimationFrame(render);
          return;
        }
      }

      // Smooth mouse spring dampening
      const m = mouseState.current;
      m.x += (m.targetX - m.x) * 0.08;
      m.y += (m.targetY - m.y) * 0.08;

      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // Background: either solid cosmic dark, or transparent for overlay
      if (!transparentBg) {
        const bgGrad = ctx.createRadialGradient(
          w * 0.5,
          h * 0.45,
          Math.min(w, h) * 0.05,
          w * 0.5,
          h * 0.5,
          Math.max(w, h) * 0.95
        );
        bgGrad.addColorStop(0, "#0C0F1A"); // Deep Arc Navy
        bgGrad.addColorStop(0.5, "#070810"); // Dark Obsidian
        bgGrad.addColorStop(1, "#030408"); // Midnight
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        if (showOverlayGlow) {
          // Cyan ambient aura
          const cyanGlow = ctx.createRadialGradient(w * 0.25, h * 0.5, 10, w * 0.25, h * 0.5, w * 0.55);
          cyanGlow.addColorStop(0, "rgba(56, 189, 248, 0.22)");
          cyanGlow.addColorStop(0.5, "rgba(2, 132, 199, 0.08)");
          cyanGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = cyanGlow;
          ctx.fillRect(0, 0, w, h);

          // Emerald ambient aura
          const emeraldGlow = ctx.createRadialGradient(w * 0.75, h * 0.55, 10, w * 0.75, h * 0.55, w * 0.55);
          emeraldGlow.addColorStop(0, "rgba(16, 185, 129, 0.20)");
          emeraldGlow.addColorStop(0.5, "rgba(5, 150, 105, 0.06)");
          emeraldGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = emeraldGlow;
          ctx.fillRect(0, 0, w, h);
        }
      }

      // Render Translucent Overlapping Sine Ribbons with normal alpha blending
      // (source-over guarantees visibility on both dark and light surfaces)
      ctx.globalCompositeOperation = "source-over";

      const step = 4; // High-precision subpixel curve sampling

      for (let rIdx = 0; rIdx < ribbons.length; rIdx++) {
        const ribbon = ribbons[rIdx];
        const upperPoints: { x: number; y: number }[] = [];
        const lowerPoints: { x: number; y: number }[] = [];

        // Sample wave contours
        for (let x = 0; x <= w + step; x += step) {
          const y = computeWaveY(x, ribbon, animTime, w, h);
          const breathe = Math.sin(x * 0.0035 + animTime * 0.015 + ribbon.phase) * 0.28;
          const halfThick = (ribbon.thickness * 0.5) * (0.85 + breathe);

          upperPoints.push({ x, y: y - halfThick });
          lowerPoints.push({ x, y: y + halfThick });
        }

        // Draw Ribbon Translucent Strip
        ctx.beginPath();
        ctx.moveTo(upperPoints[0].x, upperPoints[0].y);
        for (let i = 1; i < upperPoints.length; i++) {
          ctx.lineTo(upperPoints[i].x, upperPoints[i].y);
        }
        for (let i = lowerPoints.length - 1; i >= 0; i--) {
          ctx.lineTo(lowerPoints[i].x, lowerPoints[i].y);
        }
        ctx.closePath();

        const ribbonGrad = ctx.createLinearGradient(0, 0, w, h);
        ribbonGrad.addColorStop(0, ribbon.colorStart);
        ribbonGrad.addColorStop(0.5, ribbon.colorMid);
        ribbonGrad.addColorStop(1, ribbon.colorEnd);

        ctx.fillStyle = ribbonGrad;
        ctx.fill();

        // Glowing Crest Edge Line (Top)
        ctx.beginPath();
        ctx.moveTo(upperPoints[0].x, upperPoints[0].y);
        for (let i = 1; i < upperPoints.length; i++) {
          ctx.lineTo(upperPoints[i].x, upperPoints[i].y);
        }
        ctx.strokeStyle = ribbon.edgeColor;
        ctx.lineWidth = ribbon.lineWidth;
        ctx.shadowColor = ribbon.edgeColor;
        ctx.shadowBlur = 14;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Subtle Lower Contour Line
        ctx.beginPath();
        ctx.moveTo(lowerPoints[0].x, lowerPoints[0].y);
        for (let i = 1; i < lowerPoints.length; i++) {
          ctx.lineTo(lowerPoints[i].x, lowerPoints[i].y);
        }
        ctx.strokeStyle = ribbon.colorStart.replace(/[\d.]+\)$/, "0.40)");
        ctx.lineWidth = 1.0;
        ctx.stroke();
      }

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", onWindowResize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseout", onMouseLeave);
      if (ro) {
        ro.disconnect();
      }
      cancelAnimationFrame(animId);
    };
  }, [palette, speed, interactive, showOverlayGlow, transparentBg]);

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden pointer-events-auto ${className}`}
      style={{ opacity }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-crosshair"
      />
    </div>
  );
}

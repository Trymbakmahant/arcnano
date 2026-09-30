"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import SchematicFlowGraph from "@/component/UI/SchematicFlowGraph";
import LiveArcnetDemo from "@/component/UI/LiveArcnetDemo";
import {
  Video,
  Maximize2,
  Minimize2,
  ChevronLeft,
  Sparkles,
  CircuitBoard,
  Activity,
} from "lucide-react";

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState<"live" | "schematic">("live");
  const [cleanRecordMode, setCleanRecordMode] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedTime, setRecordedTime] = useState<number>(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Keyboard shortcut for recording or presentation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "c" || e.key === "C" || e.key === "Escape") {
        setCleanRecordMode((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // In-browser screen recording using Screen Capture API
  const startScreenRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: "browser" },
        audio: false,
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
          ? "video/webm;codecs=vp9"
          : "video/webm",
      });

      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        setIsRecording(false);
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `arcnano-schematic-circuit-${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordedTime(0);

      // Handle user stopping stream from browser chrome bar
      stream.getVideoTracks()[0].onended = () => {
        if (mediaRecorder.state !== "inactive") {
          mediaRecorder.stop();
        }
      };
    } catch (err) {
      console.error("Screen recording cancelled or failed:", err);
    }
  };

  const stopScreenRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  };

  // Recording timer increment
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-neutral-900 font-sans antialiased selection:bg-amber-500 selection:text-white relative flex flex-col justify-between overflow-x-hidden">
      {/* Background CAD Grid */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `linear-gradient(#000000 1px, transparent 1px), linear-gradient(90deg, #000000 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* TOP HEADER / CONTROLS BAR (Hidden in Clean Recording Mode) */}
      {!cleanRecordMode && (
        <header className="relative z-40 border-b border-neutral-200/90 bg-white/90 backdrop-blur-xl px-4 sm:px-6 py-3 transition-all">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
            {/* Brand + Breadcrumb */}
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center gap-1.5 text-xs font-mono text-neutral-600 hover:text-neutral-950 transition-colors bg-neutral-100 hover:bg-neutral-200/70 border border-neutral-200 px-2.5 py-1.5 rounded-md"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Protocol</span>
              </Link>

              <div className="h-4 w-[1px] bg-neutral-200 hidden sm:block" />

              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-neutral-950 flex items-center justify-center p-1 shadow-xs">
                  <Image
                    src="/arcnano-icon-white.png"
                    alt="ArcNano"
                    width={16}
                    height={16}
                    className="w-3.5 h-3.5 object-contain"
                  />
                </div>
                <span className="text-sm font-semibold tracking-tight text-neutral-950">
                  ArcNano Protocol Studio
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-800 border border-emerald-500/20 uppercase font-medium">
                  Arc Testnet (5042002)
                </span>
              </div>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center p-1 bg-neutral-100 border border-neutral-200 rounded-lg shadow-2xs">
              <button
                onClick={() => setActiveTab("live")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all ${
                  activeTab === "live"
                    ? "bg-white text-neutral-950 shadow-xs border border-neutral-200/80 font-bold"
                    : "text-neutral-600 hover:text-neutral-950"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Testnet Sandbox</span>
              </button>

              <button
                onClick={() => setActiveTab("schematic")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all ${
                  activeTab === "schematic"
                    ? "bg-white text-neutral-950 shadow-xs border border-neutral-200/80 font-bold"
                    : "text-neutral-600 hover:text-neutral-950"
                }`}
              >
                <CircuitBoard className="w-3.5 h-3.5 text-sky-600" />
                <span>Circuit Schematic</span>
              </button>
            </div>

            {/* Recording & Presentation Actions */}
            <div className="flex items-center gap-2.5">
              {/* Record Screen in Browser Button */}
              {isRecording ? (
                <button
                  onClick={stopScreenRecording}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-medium animate-pulse shadow-sm"
                >
                  <span className="w-2 h-2 rounded-full bg-white"></span>
                  <span>Stop ({recordedTime}s)</span>
                </button>
              ) : (
                <button
                  onClick={startScreenRecording}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-800 text-xs font-mono font-medium transition-colors shadow-xs"
                  title="Capture video directly from browser"
                >
                  <Video className="w-3.5 h-3.5 text-rose-500" />
                  <span className="hidden sm:inline">Record Clip</span>
                </button>
              )}

              {/* Clean Record Mode Toggle */}
              <button
                onClick={() => setCleanRecordMode(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-mono font-medium transition-colors shadow-xs"
                title="Hide all toolbars for a clean recording (Press C or Esc)"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Cinema View (C)</span>
              </button>
            </div>
          </div>
        </header>
      )}

      {/* FLOATING ESCAPE PILL (Only visible in Clean Record Mode) */}
      {cleanRecordMode && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-neutral-300 text-[11px] font-mono text-neutral-700 shadow-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Clean View Active</span>
            <button
              onClick={() => setCleanRecordMode(false)}
              className="ml-2 px-2 py-0.5 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-900 flex items-center gap-1 font-semibold"
            >
              <Minimize2 className="w-3 h-3" />
              <span>Exit (Esc)</span>
            </button>
          </div>
        </div>
      )}

      {/* MAIN STAGE CANVAS */}
      <main className="flex-1 flex flex-col justify-start max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10">
        {activeTab === "live" ? (
          <LiveArcnetDemo />
        ) : (
          <SchematicFlowGraph />
        )}
      </main>

      {/* FOOTER IN CLEAN RECORD MODE (MINIMAL) */}
      {!cleanRecordMode && (
        <footer className="border-t border-neutral-200/90 bg-white/80 backdrop-blur-sm py-3 px-6 text-center text-[11px] font-mono text-neutral-500">
          Tip: Hit <kbd className="px-1.5 py-0.5 bg-neutral-100 border border-neutral-200 rounded text-neutral-800">Cinema View</kbd> or press <kbd className="px-1.5 py-0.5 bg-neutral-100 border border-neutral-200 rounded text-neutral-800">C</kbd> to record a clean video for LinkedIn. Toggle <kbd className="px-1.5 py-0.5 bg-neutral-100 border border-neutral-200 rounded text-neutral-800">Arcscan Compare</kbd> to show what the public block explorer sees.
        </footer>
      )}
    </div>
  );
}

"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";

export type ThemeId = "solar-obsidian" | "light";

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  tagline: string;
  isDark: boolean;
  paletteKey: "solar" | "aurora";
  colors: {
    bg: string;
    surface: string;
    primary: string;
    accent: string;
    zkAccent?: string;
  };
}

export const THEMES_LIST: ThemeConfig[] = [
  {
    id: "solar-obsidian",
    name: "Solar Obsidian",
    tagline: "Obsidian & Solar Gold (Dark)",
    isDark: true,
    paletteKey: "solar",
    colors: {
      bg: "#07090D",
      surface: "#0D1117",
      primary: "#F59E0B",
      accent: "#FBBF24",
      zkAccent: "#A78BFA",
    },
  },
  {
    id: "light",
    name: "Clean Light",
    tagline: "Daylight Minimal (Light)",
    isDark: false,
    paletteKey: "aurora",
    colors: {
      bg: "#FAFAFA",
      surface: "#FFFFFF",
      primary: "#0284C7",
      accent: "#7C3AED",
      zkAccent: "#10B981",
    },
  },
];

interface ThemeSwitcherProps {
  currentTheme: ThemeId;
  onThemeChange: (themeId: ThemeId) => void;
  className?: string;
}

export default function ThemeSwitcher({
  currentTheme,
  onThemeChange,
  className = "",
}: ThemeSwitcherProps) {
  const isDark = currentTheme === "solar-obsidian";

  const toggleTheme = () => {
    onThemeChange(isDark ? "light" : "solar-obsidian");
  };

  return (
    <div className={`relative ${className}`}>
      {/* 1-Click Smooth Theme Toggle Pill */}
      <button
        onClick={toggleTheme}
        aria-label="Toggle theme between Solar Obsidian and Clean Light"
        title={`Switch to ${isDark ? "Clean Light" : "Solar Obsidian"}`}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/12 text-white transition-all cursor-pointer shadow-sm group backdrop-blur-md"
      >
        {/* Animated Sun / Moon Icon */}
        <motion.div
          key={isDark ? "dark" : "light"}
          initial={{ rotate: -90, scale: 0.7, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="flex items-center justify-center"
        >
          {isDark ? (
            <Sun className="w-3.5 h-3.5 text-amber-400 group-hover:text-amber-300 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-indigo-300 group-hover:text-white" />
          )}
        </motion.div>

        {/* Theme Name Badge */}
        <span className="text-xs font-medium tracking-tight text-white/90 group-hover:text-white">
          {isDark ? "Solar Obsidian" : "Clean Light"}
        </span>

        {/* Swatch Indicator */}
        <span
          className="w-2 h-2 rounded-full ring-1 ring-white/20 transition-colors"
          style={{
            backgroundColor: isDark ? "#F59E0B" : "#0284C7",
          }}
        />
      </button>
    </div>
  );
}

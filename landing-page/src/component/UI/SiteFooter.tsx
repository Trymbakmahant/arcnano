"use client";

import React, { memo } from "react";
import Image from "next/image";
import { ExternalLink } from "lucide-react";

function SiteFooter() {
  return (
    <footer className="border-t border-neutral-200/90 bg-white/70 backdrop-blur-md py-6 px-6 sm:px-8 relative z-10 transition-colors select-none">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-md bg-neutral-950 flex items-center justify-center p-1 shadow-xs">
            <Image
              src="/arcnano-icon-white.png"
              alt="ArcNano Icon"
              width={16}
              height={16}
              className="w-3.5 h-3.5 object-contain"
            />
          </div>
          <Image
            src="/arcnano-logo.png"
            alt="ArcNano"
            width={100}
            height={18}
            className="h-4 w-auto object-contain"
          />
          <span className="text-xs text-neutral-400 font-mono hidden sm:inline">
            • MIT License
          </span>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 text-xs font-mono text-neutral-600">
          <a
            className="hover:text-neutral-950 transition-colors flex items-center gap-1"
            href="https://docs.arcnano.xyz/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>Docs</span>
            <ExternalLink className="w-3 h-3 text-neutral-400" />
          </a>
          <span className="text-neutral-300">•</span>
          <a
            className="hover:text-neutral-950 transition-colors"
            href="https://github.com/Trymbakmahant/arcnano"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <span className="text-neutral-300">•</span>
          <a
            className="hover:text-neutral-950 transition-colors"
            href="https://x.com/0xarcnano"
            target="_blank"
            rel="noopener noreferrer"
          >
            X (@0xarcnano)
          </a>
          <span className="text-neutral-300">•</span>
          <a
            className="hover:text-red-700 transition-colors"
            href="https://www.npmjs.com/package/arcnano-x402"
            target="_blank"
            rel="noopener noreferrer"
          >
            npm
          </a>
          <span className="text-neutral-300">•</span>
          <a
            className="hover:text-blue-700 transition-colors"
            href="https://pypi.org/project/arczk-agent/"
            target="_blank"
            rel="noopener noreferrer"
          >
            PyPI
          </a>
        </div>
      </div>
    </footer>
  );
}

export default memo(SiteFooter);

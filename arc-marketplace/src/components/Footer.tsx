import React from "react";

export function Footer() {
  return (
    <footer className="w-full border-t border-[#e2e8f0] bg-white py-6 px-4 sm:px-8 text-xs font-mono text-slate-500">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-[#00DC82]"></span>
          <span className="text-slate-700 font-semibold">Arcnano-marketplace</span>
        </div>
        <div className="flex items-center space-x-6 text-slate-600">
          <a className="hover:text-slate-900 transition-colors" href="https://docs.arcnano.xyz/">
            Docs
          </a>
          <a className="hover:text-slate-900 transition-colors" href="#">
            Spec
          </a>
          <a className="hover:text-slate-900 transition-colors" href="https://github.com/Trymbakmahant/arcnano">
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}

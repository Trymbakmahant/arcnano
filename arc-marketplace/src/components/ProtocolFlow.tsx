import React from "react";

export function ProtocolFlow() {
  return (
    <section className="w-full py-16 bg-white border-y border-[#e2e8f0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col gap-10">
        {/* Header */}
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 font-mono text-xs text-slate-800 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00DC82]"></span> How It Works
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            How Autonomous Machine Payments Work
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            AI agents securely discover, lease, and pay for digital assets and tools in real-time on Arc L1 without manual checkout.
          </p>
        </div>

        {/* 4 Steps Flow */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-[#f8fafb] border border-[#e2e8f0] rounded-xl p-5 flex flex-col justify-between">
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-md bg-[#0a0f1d] flex items-center justify-center font-mono text-xs text-white font-bold">
                  01
                </span>
                <span className="font-mono text-[11px] text-slate-500 uppercase">Step 1</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">Unauthenticated Probe</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Agent initiates request without long-term API keys or session cookies:
              </p>
              <div className="bg-[#0a0f1d] p-3 rounded-lg font-mono text-xs text-[#00DC82]">
                GET /api/v1/analyze
                <br />
                <span className="text-slate-400">Host: x402.gateway</span>
              </div>
            </div>
            <div className="mt-4 pt-2 font-mono text-xs text-slate-500 flex items-center justify-between">
              <span>Latency: 0ms</span>
              <span>→</span>
            </div>
          </div>

          <div className="bg-[#f8fafb] border border-[#e2e8f0] rounded-xl p-5 flex flex-col justify-between">
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-md bg-emerald-600 flex items-center justify-center font-mono text-xs text-white font-bold">
                  02
                </span>
                <span className="font-mono text-[11px] text-emerald-800 uppercase font-semibold">
                  Challenge
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">Payment Invoice</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Gateway returns cryptographic invoice and execution cost:
              </p>
              <div className="bg-[#0a0f1d] p-3 rounded-lg font-mono text-xs text-amber-300">
                Payment Required (Invoice)
                <br />
                <span className="text-slate-400">Invoice: lnbc10...</span>
              </div>
            </div>
            <div className="mt-4 pt-2 font-mono text-xs text-amber-700 flex items-center justify-between">
              <span>Demand issued</span>
              <span>→</span>
            </div>
          </div>

          <div className="bg-[#f8fafb] border border-[#e2e8f0] rounded-xl p-5 flex flex-col justify-between">
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-md bg-[#0a0f1d] flex items-center justify-center font-mono text-xs text-white font-bold">
                  03
                </span>
                <span className="font-mono text-[11px] text-slate-500 uppercase">Settlement</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">Autonomous Payment</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Local agent runtime signs &amp; pays via Arc L1 channel:
              </p>
              <div className="bg-[#0a0f1d] p-3 rounded-lg font-mono text-xs text-[#00DC82]">
                Authorization: L402
                <br />
                <span className="text-slate-400">preimage: 0x9f402c...</span>
              </div>
            </div>
            <div className="mt-4 pt-2 font-mono text-xs text-emerald-700 flex items-center justify-between">
              <span>Settled in ~6ms</span>
              <span>→</span>
            </div>
          </div>

          <div className="bg-[#f8fafb] border border-[#e2e8f0] rounded-xl p-5 flex flex-col justify-between">
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-md bg-[#00DC82] text-slate-950 flex items-center justify-center font-mono text-xs font-bold">
                  04
                </span>
                <span className="font-mono text-[11px] text-emerald-800 uppercase font-semibold">
                  Release
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">200 OK Delivery</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Gateway unlocks compute &amp; streams payload without retaining user session:
              </p>
              <div className="bg-[#0a0f1d] p-3 rounded-lg font-mono text-xs text-cyan-300">
                HTTP/1.1 200 OK
                <br />
                <span className="text-slate-400">Content-Type: app/json</span>
              </div>
            </div>
            <div className="mt-4 pt-2 font-mono text-xs text-emerald-700 font-semibold flex items-center justify-between">
              <span>Zero Session State</span>
              <span>✓</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

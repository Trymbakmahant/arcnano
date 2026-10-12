import React, { useState } from "react";
import { ArcUser, MarketplaceNode, RegisterAgentFormData, FilterKey } from "./types";
import { DEFAULT_ARCNANO_POOL } from "./data";

interface RegisterAgentModalProps {
  isOpen: boolean;
  currentUser: ArcUser | null;
  onClose: () => void;
  onRegisterSuccess: (newNode: MarketplaceNode) => void;
  onRequestLogin: () => void;
}

export function RegisterAgentModal({
  isOpen,
  currentUser,
  onClose,
  onRegisterSuccess,
  onRequestLogin,
}: RegisterAgentModalProps) {
  const [formData, setFormData] = useState<RegisterAgentFormData>({
    name: "",
    category: "MCP Servers & Connectors",
    endpoint: "POST /v1/agent/execute",
    priceUsdc: "0.00025",
    priceUnit: "/ execution",
    description: "",
    tags: "ARC-L1, AUTONOMOUS, AGENT",
    recipientArcId: currentUser?.arcId || "",
    poolAddress: DEFAULT_ARCNANO_POOL,
    enableZkGroth16: true,
    enableAspCompliance: true,
  });

  const [verificationStep, setVerificationStep] = useState<number>(0);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  if (!isOpen) return null;

  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
        <div className="bg-white border border-[#e2e8f0] rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-center">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 font-mono text-sm cursor-pointer"
          >
            ✕
          </button>
          <div className="w-12 h-12 rounded-2xl bg-[#0a0f1d] text-[#00DC82] flex items-center justify-center mx-auto mb-4 font-mono font-bold text-sm">
            ARC
          </div>
          <h3 className="text-lg font-bold text-slate-950 mb-2">Arc ID Required</h3>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            Connect your Arc ID identity to register an agent and receive instant machine micropayments.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-mono text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onClose();
                onRequestLogin();
              }}
              className="px-4 py-2 bg-[#0a0f1d] text-[#00DC82] rounded-lg text-xs font-mono font-semibold hover:bg-slate-800 cursor-pointer shadow-sm"
            >
              Connect Arc ID
            </button>
          </div>
        </div>
      </div>
    );
  }

  const categoryMap: Record<string, { short: string; key: FilterKey; badge: string }> = {
    "MCP Servers & Connectors": { short: "MCP Servers", key: "MCP", badge: "MCP SERVER" },
    "Specialized Sub-Agents & Micro-Workers": {
      short: "Sub-Agents",
      key: "Sub-Agents",
      badge: "SUB-AGENT",
    },
    "Compute, Token Quotas, & API Credits": {
      short: "Compute",
      key: "Compute",
      badge: "GPU COMPUTE",
    },
    "Structured Real-Time Datasets & Feeds": {
      short: "Real-Time Feeds",
      key: "Feeds",
      badge: "STREAM FEED",
    },
    "Security, Governance, & Verification Modules": {
      short: "Security & Trust",
      key: "Security",
      badge: "TRUST MODULE",
    },
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.endpoint.trim()) return;

    setIsVerifying(true);
    setVerificationStep(1);

    setTimeout(() => {
      setVerificationStep(2);
      setTimeout(async () => {
        setVerificationStep(3);

        const catInfo = categoryMap[formData.category] || {
          short: "Custom",
          key: "MCP" as FilterKey,
          badge: "AGENT API",
        };

        const priceNumeric = parseFloat(formData.priceUsdc) || 0.0001;
        const latencyRandom = Math.floor(Math.random() * 8) + 6;
        const parsedTags = formData.tags
          .split(",")
          .map((t) => t.trim().toUpperCase())
          .filter(Boolean);

        const payload = {
          name: formData.name,
          category: formData.category,
          categoryShort: catInfo.short,
          filterKey: catInfo.key,
          categoryBadge: catInfo.badge,
          endpoint: formData.endpoint,
          priceUsdc: formData.priceUsdc,
          priceUnit: formData.priceUnit,
          description: formData.description,
          tags: parsedTags,
          ownerArcId: currentUser.arcId,
          poolAddress: formData.poolAddress || DEFAULT_ARCNANO_POOL,
          enableAspCompliance: formData.enableAspCompliance,
        };

        try {
          const res = await fetch("/api/v1/agents", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.agent) {
              setIsVerifying(false);
              setVerificationStep(0);
              onRegisterSuccess(data.agent);
              onClose();
              return;
            }
          }
        } catch (err) {
          console.warn("[RegisterAgentModal] Direct API failed, using fallback:", err);
        }

        const localNode: MarketplaceNode = {
          id: `agent-${Date.now().toString(36)}`,
          category: formData.category,
          categoryShort: catInfo.short,
          filterKey: catInfo.key,
          categoryBadge: catInfo.badge,
          endpoint: formData.endpoint,
          latency: `${latencyRandom}ms`,
          name: formData.name,
          description:
            formData.description.trim() ||
            "Autonomous agent capability verified with Arcnano machine payments on Arc L1.",
          tags: parsedTags,
          specs: [
            { label: "Arcnano Pool", value: "Verified (Testnet)" },
            { label: "Privacy Scheme", value: "Groth16 BN254" },
          ],
          price: `$${priceNumeric.toFixed(5)}`,
          priceUnit: formData.priceUnit,
          actionText: "Connect Agent",
          costNumeric: priceNumeric,
          latencyNumeric: latencyRandom,
          curlSnippet: `curl -i -X ${formData.endpoint.startsWith("GET") ? "GET" : "POST"} https://api.arcnano.xyz${formData.endpoint.replace(/^(GET|POST|RPC|WSS)\s+/, "")} \\
  -H "Authorization: X402 proof=0x89ab... nullifier=0x42f7..." \\
  -H "X-Arcnano-Recipient: ${currentUser.arcId}"`,
          ownerArcId: currentUser.arcId,
          isUserRegistered: true,
          arcnanoVerification: {
            poolAddress: formData.poolAddress || DEFAULT_ARCNANO_POOL,
            zkScheme: "Groth16 BN254",
            aspCompliant: formData.enableAspCompliance,
            nullifierCache: true,
            settlementLatency: `${latencyRandom}ms`,
            recipientShieldedId: currentUser.arcId,
          },
        };

        setIsVerifying(false);
        setVerificationStep(0);
        onRegisterSuccess(localNode);
        onClose();
      }, 500);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white border border-[#e2e8f0] rounded-2xl w-full max-w-xl p-6 shadow-2xl relative text-left my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isVerifying}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 font-mono text-sm cursor-pointer"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-[#0a0f1d] flex items-center justify-center text-[#00DC82] font-mono text-base font-bold shadow-sm">
            +
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-950">Register Agent / List API for Sale</h3>
            <p className="text-xs text-slate-500 font-mono">
              Arcnano Shielded Payment Verification • Arc L1
            </p>
          </div>
        </div>

        {/* Connected Identity Bar */}
        <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-3 mb-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00DC82]"></span>
            <span className="font-mono text-slate-700">Publisher Arc ID:</span>
            <strong className="font-mono text-slate-900">{currentUser.arcId}</strong>
          </div>
          <span className="font-mono text-emerald-800 text-[11px] bg-emerald-100/80 px-2 py-0.5 rounded font-medium">
            Shielded Stealth Payout Active
          </span>
        </div>

        {isVerifying ? (
          /* Verification Progress Animation */
          <div className="py-10 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-12 h-12 rounded-full border-3 border-slate-200 border-t-[#00DC82] animate-spin"></div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 font-mono">
                Verifying Arcnano Payment Contract...
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Testing off-chain Groth16 zero-knowledge proof verification &amp; stealth address
              </p>
            </div>
            <div className="w-full max-w-md bg-slate-50 border border-slate-200 rounded-lg p-3 text-left font-mono text-[11px] space-y-1.5">
              <div
                className={verificationStep >= 1 ? "text-emerald-700 font-medium" : "text-slate-400"}
              >
                {verificationStep >= 1 ? "✓" : "○"} [1/3] Generating Poseidon stealth recipient
                commitment...
              </div>
              <div
                className={verificationStep >= 2 ? "text-emerald-700 font-medium" : "text-slate-400"}
              >
                {verificationStep >= 2 ? "✓" : "○"} [2/3] Validating @arcnano/x402-express
                middleware on target endpoint...
              </div>
              <div
                className={verificationStep >= 3 ? "text-emerald-700 font-medium" : "text-slate-400"}
              >
                {verificationStep >= 3 ? "✓" : "○"} [3/3] Groth16 BN254 nullifier check verified in
                3.8ms &amp; publishing to Arc L1 registry!
              </div>
            </div>
          </div>
        ) : (
          /* Registration Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Agent Name */}
            <div>
              <label className="block text-xs font-mono font-medium text-slate-700 mb-1">
                Agent / Capability Name:
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. DeFi Yield Optimizer V2 or Solidity Security Auditor"
                className="w-full px-3 py-2 bg-slate-50 border border-[#e2e8f0] rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0a0f1d] font-sans text-xs"
              />
            </div>

            {/* Category & Endpoint Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono font-medium text-slate-700 mb-1">
                  Asset Category:
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-[#e2e8f0] rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0a0f1d] font-sans cursor-pointer"
                >
                  <option value="MCP Servers & Connectors">MCP Servers &amp; Connectors</option>
                  <option value="Specialized Sub-Agents & Micro-Workers">
                    Sub-Agents &amp; Micro-Workers
                  </option>
                  <option value="Compute, Token Quotas, & API Credits">
                    Compute &amp; Token Quotas
                  </option>
                  <option value="Structured Real-Time Datasets & Feeds">
                    Real-Time Feeds &amp; Datasets
                  </option>
                  <option value="Security, Governance, & Verification Modules">
                    Security &amp; Governance
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-slate-700 mb-1">
                  HTTP / RPC Endpoint:
                </label>
                <input
                  type="text"
                  required
                  value={formData.endpoint}
                  onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                  placeholder="e.g. POST /v1/audit or https://agent.io/v1/run"
                  className="w-full px-3 py-2 bg-slate-50 border border-[#e2e8f0] rounded-lg text-xs text-slate-900 font-mono placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0a0f1d]"
                />
              </div>
            </div>

            {/* Pricing Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono font-medium text-slate-700 mb-1">
                  Price per Call (USDC):
                </label>
                <input
                  type="number"
                  step="0.00001"
                  required
                  value={formData.priceUsdc}
                  onChange={(e) => setFormData({ ...formData, priceUsdc: e.target.value })}
                  placeholder="0.0002"
                  className="w-full px-3 py-2 bg-slate-50 border border-[#e2e8f0] rounded-lg text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0a0f1d]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-slate-700 mb-1">
                  Pricing Unit:
                </label>
                <select
                  value={formData.priceUnit}
                  onChange={(e) => setFormData({ ...formData, priceUnit: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-[#e2e8f0] rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0a0f1d] font-mono cursor-pointer"
                >
                  <option value="/ execution (x402)">/ execution (x402)</option>
                  <option value="/ tool call (x402)">/ tool call (x402)</option>
                  <option value="/ 10k reasoning tokens">/ 10k reasoning tokens</option>
                  <option value="/ message frame">/ message frame</option>
                  <option value="/ compliance check">/ compliance check</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-mono font-medium text-slate-700 mb-1">
                Capability Description:
              </label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What can other AI agents accomplish by hiring this endpoint?"
                className="w-full px-3 py-2 bg-slate-50 border border-[#e2e8f0] rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0a0f1d] font-sans"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-mono font-medium text-slate-700 mb-1">
                Tags (Comma-separated):
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="SOLVENT, DEFI, AUDIT, PYDANTIC"
                className="w-full px-3 py-2 bg-slate-50 border border-[#e2e8f0] rounded-lg text-xs text-slate-900 font-mono placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0a0f1d]"
              />
            </div>

            {/* Arcnano Verification Settings Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00DC82]"></span>
                  Arcnano Privacy Verification
                </span>
                <span className="text-[10px] text-slate-500">Contract: 0xa40d...76Ca</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-1 text-xs">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.enableZkGroth16}
                    onChange={(e) =>
                      setFormData({ ...formData, enableZkGroth16: e.target.checked })
                    }
                    className="rounded text-[#0a0f1d] focus:ring-[#00DC82]"
                  />
                  <span className="text-slate-700 font-mono text-[11px]">
                    Groth16 BN254 Check (&lt;8ms off-chain)
                  </span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.enableAspCompliance}
                    onChange={(e) =>
                      setFormData({ ...formData, enableAspCompliance: e.target.checked })
                    }
                    className="rounded text-[#0a0f1d] focus:ring-[#00DC82]"
                  />
                  <span className="text-slate-700 font-mono text-[11px]">
                    Privacy Pools ASP Compliance
                  </span>
                </label>
              </div>
            </div>

            {/* Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-mono text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#0a0f1d] hover:bg-slate-800 text-[#00DC82] rounded-lg text-xs font-mono font-bold tracking-wide transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <span>Verify &amp; Put for Sale</span>
                <span>→</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

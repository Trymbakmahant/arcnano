"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { AssetClassesSection } from "@/components/AssetClassesSection";
import { SearchFilterSection } from "@/components/SearchFilterSection";
import { CatalogGrid } from "@/components/CatalogGrid";
import { SdkDiscoverySection } from "@/components/SdkDiscoverySection";
import { ProtocolFlow } from "@/components/ProtocolFlow";
import { ReplTerminal } from "@/components/ReplTerminal";
import { Footer } from "@/components/Footer";
import { ArcIdLoginModal } from "@/components/ArcIdLoginModal";
import { RegisterAgentModal } from "@/components/RegisterAgentModal";
import { MARKETPLACE_ITEMS } from "@/components/data";
import { FilterKey, MarketplaceNode, ArcUser } from "@/components/types";

const INITIAL_USER: ArcUser = {
  arcId: "agent-master.arc",
  shieldedAddress: "0xarc7f9b821a3e...402c",
  balanceUsdc: 248.5,
  vaultNotesCount: 14,
  network: "Arc Testnet (5042002)",
};

export default function ArcMarketplacePage() {
  const [currentUser, setCurrentUser] = useState<ArcUser | null>(INITIAL_USER);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(false);
  const [nodes, setNodes] = useState<MarketplaceNode[]>(MARKETPLACE_ITEMS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [activeFilter, setActiveFilter] = useState<FilterKey>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"catalog" | "raw">("catalog");
  const [selectedSnippet, setSelectedSnippet] = useState<MarketplaceNode>(MARKETPLACE_ITEMS[0]);
  const [terminalState, setTerminalState] = useState<"initial" | "running" | "done">("initial");

  // Keyboard shortcut: ESC to clear search
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSearchQuery("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch agents from database registry on mount
  useEffect(() => {
    async function fetchAgents() {
      try {
        const res = await fetch("/api/v1/agents");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.agents) && data.agents.length > 0) {
            setNodes(data.agents);
          }
        }
      } catch (err) {
        console.warn("[page] Could not fetch agents from Supabase API, keeping local seed:", err);
      }
    }
    fetchAgents();
  }, []);

  const filteredItems = useMemo(() => {
    return nodes.filter((item) => {
      // Category filter matching
      if (activeFilter !== "All" && item.filterKey !== activeFilter) {
        return false;
      }
      // Search text
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesEndpoint = item.endpoint.toLowerCase().includes(q);
        const matchesOwner = item.ownerArcId?.toLowerCase().includes(q);
        const matchesTags = item.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesEndpoint && !matchesOwner && !matchesTags) {
          return false;
        }
      }
      return true;
    });
  }, [nodes, activeFilter, searchQuery]);

  const handleSelectRepl = (node: MarketplaceNode) => {
    setSelectedSnippet(node);
    const element = document.getElementById("repl-terminal-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSelectSdk = (node: MarketplaceNode) => {
    setSelectedSnippet(node);
    const element = document.getElementById("sdk-discovery");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleRunProtocol = () => {
    setTerminalState("running");
    setTimeout(() => {
      setTerminalState("done");
    }, 450);
  };

  const handleExploreClick = () => {
    const el = document.getElementById("browse-catalog");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSpecClick = () => {
    setViewMode((prev) => (prev === "raw" ? "catalog" : "raw"));
    const el = document.getElementById("browse-catalog");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleExecuteFirst = () => {
    const first = filteredItems[0];
    if (first) {
      handleSelectRepl(first);
    }
  };

  const handleResetFilters = () => {
    setActiveFilter("All");
    setSearchQuery("");
  };

  const handleRegisterSuccess = (newNode: MarketplaceNode) => {
    setNodes((prev) => [newNode, ...prev.filter((n) => n.id !== newNode.id)]);
    setSelectedSnippet(newNode);
    setToastMessage(`✓ Agent "${newNode.name}" registered and published on Arc!`);
    setTimeout(() => setToastMessage(null), 5000);

    const el = document.getElementById("browse-catalog");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-full font-sans antialiased text-[#0a0f1d] bg-[#f8fafb] flex flex-col justify-between selection:bg-[#00DC82]/20 selection:text-[#0a0f1d] relative">
      {/* Success Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0a0f1d] text-white border border-emerald-500/50 rounded-xl px-4 py-3 shadow-2xl flex items-center gap-3 animate-fade-in font-mono text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00DC82] animate-pulse"></span>
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. Main Navigation Bar */}
      <Navbar
        activeFilter={activeFilter}
        onSelectFilter={setActiveFilter}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onOpenRegister={() => setIsRegisterModalOpen(true)}
        onDisconnect={() => setCurrentUser(null)}
      />

      {/* 3. Main Content Sections */}
      <main className="flex-grow">
        {/* Hero Section */}
        <HeroSection
          onExploreClick={handleExploreClick}
          onListAgentClick={() => setIsRegisterModalOpen(true)}
          onSpecClick={handleSpecClick}
          isSpecActive={viewMode === "raw"}
        />

        {/* 5 Core Digital Asset Classes Section */}
        <AssetClassesSection activeFilter={activeFilter} onSelectFilter={setActiveFilter} />

        {/* Search & Filter Section */}
        <SearchFilterSection
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeFilter={activeFilter}
          onSelectFilter={setActiveFilter}
          onExecuteFirst={handleExecuteFirst}
        />

        {/* Catalog Grid or OpenAPI/MCP Raw Spec View */}
        <CatalogGrid
          nodes={filteredItems}
          activeFilter={activeFilter}
          viewMode={viewMode}
          onSelectRepl={handleSelectRepl}
          onSelectSdk={handleSelectSdk}
          onResetFilters={handleResetFilters}
        />

        {/* Autonomous Agent SDK Discovery & Privacy Payment Guide */}
        <SdkDiscoverySection
          selectedNode={selectedSnippet}
          allNodes={nodes}
          onSelectNode={(node) => setSelectedSnippet(node)}
        />

        {/* Protocol Flow Architecture Explainer */}
        <ProtocolFlow />

        {/* Live Arcnano x402 REPL Terminal */}
        <ReplTerminal
          selectedNode={selectedSnippet}
          terminalState={terminalState}
          onRunProtocol={handleRunProtocol}
        />
      </main>

      {/* 4. Minimalist Footer */}
      <Footer />

      {/* 5. Modals */}
      <ArcIdLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={(user) => setCurrentUser(user)}
      />

      <RegisterAgentModal
        isOpen={isRegisterModalOpen}
        currentUser={currentUser}
        onClose={() => setIsRegisterModalOpen(false)}
        onRegisterSuccess={handleRegisterSuccess}
        onRequestLogin={() => setIsLoginModalOpen(true)}
      />
    </div>
  );
}

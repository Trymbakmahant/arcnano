"use client";

import React, { useState } from "react";
import { Check, Copy, Info, AlertTriangle, AlertOctagon, Lightbulb, ShieldAlert, ExternalLink } from "lucide-react";
import PaymentLifecycleFlow from "./visuals/PaymentLifecycleFlow";
import DoubleSpendSimulator from "./visuals/DoubleSpendSimulator";
import PrivacyComparisonMatrix from "./visuals/PrivacyComparisonMatrix";
import CircuitPipelineVisualizer from "./visuals/CircuitPipelineVisualizer";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyCode = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const lines = content.trim().split("\n");
  const renderedElements: React.ReactNode[] = [];

  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLang = "";
  let codeBlockCounter = 0;

  let inAlert = false;
  let alertType = "";
  let alertBuffer: string[] = [];

  let inTable = false;
  let tableHeader: string[] = [];
  let tableRows: string[][] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check code blocks
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        const blockId = codeBlockCounter++;
        const codeText = codeBuffer.join("\n");
        renderedElements.push(
          <div key={`code-${blockId}`} className="relative my-4 group">
            {codeLang && (
              <div className="flex items-center justify-between px-4 py-1.5 text-[11px] font-mono text-[var(--gh-text-muted)] bg-[var(--gh-canvas-subtle)] border-t border-x border-[var(--gh-border)] rounded-t-md">
                <span>{codeLang}</span>
                <button
                  onClick={() => copyCode(codeText, blockId)}
                  className="flex items-center gap-1 text-[var(--gh-text-muted)] hover:text-[var(--gh-text)] transition-colors cursor-pointer"
                >
                  {copiedIndex === blockId ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedIndex === blockId ? "Copied" : "Copy"}</span>
                </button>
              </div>
            )}
            <pre className={codeLang ? "rounded-t-none" : ""}>
              <code>{codeText}</code>
            </pre>
          </div>
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        codeLang = line.replace("```", "").trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Interactive Visual Embeds
    if (line.trim() === ":::flow-payment") {
      renderedElements.push(<PaymentLifecycleFlow key={`vis-pay-${i}`} />);
      continue;
    }
    if (line.trim() === ":::flow-doublespend") {
      renderedElements.push(<DoubleSpendSimulator key={`vis-ds-${i}`} />);
      continue;
    }
    if (line.trim() === ":::flow-privacy") {
      renderedElements.push(<PrivacyComparisonMatrix key={`vis-priv-${i}`} />);
      continue;
    }
    if (line.trim() === ":::flow-circuit") {
      renderedElements.push(<CircuitPipelineVisualizer key={`vis-circ-${i}`} />);
      continue;
    }

    // GitHub Alerts: > [!NOTE], > [!TIP], > [!IMPORTANT], > [!WARNING], > [!CAUTION]
    if (line.startsWith("> [!")) {
      inAlert = true;
      if (line.includes("[!NOTE]")) alertType = "note";
      else if (line.includes("[!TIP]")) alertType = "tip";
      else if (line.includes("[!IMPORTANT]")) alertType = "important";
      else if (line.includes("[!WARNING]")) alertType = "warning";
      else if (line.includes("[!CAUTION]")) alertType = "caution";
      alertBuffer = [];
      continue;
    }

    if (inAlert) {
      if (line.startsWith(">")) {
        alertBuffer.push(line.replace(/^>\s?/, ""));
        continue;
      } else {
        const alertText = alertBuffer.join(" ");
        const getAlertIcon = () => {
          switch (alertType) {
            case "note":
              return <Info className="w-4 h-4 shrink-0 mt-0.5" />;
            case "tip":
              return <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" />;
            case "important":
              return <AlertOctagon className="w-4 h-4 shrink-0 mt-0.5" />;
            case "warning":
              return <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />;
            case "caution":
              return <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />;
            default:
              return <Info className="w-4 h-4 shrink-0 mt-0.5" />;
          }
        };

        renderedElements.push(
          <div
            key={`alert-${i}`}
            className={`gh-alert gh-alert-${alertType} my-4 flex items-start gap-2.5 leading-relaxed`}
          >
            {getAlertIcon()}
            <div>
              <strong className="uppercase font-mono text-[11px] block mb-0.5 tracking-wider">
                {alertType}
              </strong>
              <span>{alertText}</span>
            </div>
          </div>
        );
        inAlert = false;
        alertBuffer = [];
      }
    }

    // Markdown Table parsing
    if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
      const cells = line
        .trim()
        .slice(1, -1)
        .split("|")
        .map((c) => c.trim());

      // If it's a separator line (|---|---|)
      if (cells.every((c) => /^:?-+:?$/.test(c))) {
        continue;
      }

      if (!inTable) {
        inTable = true;
        tableHeader = cells;
        tableRows = [];
        continue;
      } else {
        tableRows.push(cells);
        continue;
      }
    } else if (inTable) {
      // Table ended
      renderedElements.push(
        <div key={`table-${i}`} className="my-5 overflow-x-auto rounded-md border border-[var(--gh-border)]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--gh-canvas-subtle)] border-b border-[var(--gh-border)]">
                {tableHeader.map((th, thIdx) => (
                  <th key={thIdx} className="py-2.5 px-3.5 font-semibold text-[var(--gh-text)]">
                    {formatInline(th)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--gh-border)]">
              {tableRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-[var(--gh-canvas-subtle)] transition-colors">
                  {row.map((td, tdIdx) => (
                    <td key={tdIdx} className="py-2 px-3.5 text-[var(--gh-text)]">
                      {formatInline(td)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      inTable = false;
      tableHeader = [];
      tableRows = [];
    }

    // Horizontal Divider
    if (line.trim() === "---" || line.trim() === "***") {
      renderedElements.push(<hr key={`hr-${i}`} className="my-6 border-[var(--gh-border)]" />);
      continue;
    }

    // Headings
    if (line.startsWith("# ")) {
      renderedElements.push(
        <h1
          key={`h1-${i}`}
          id={line.slice(2).toLowerCase().replace(/[^a-z0-9]+/g, "-")}
          className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--gh-text)] pb-2 mb-4 border-b border-[var(--gh-border)] mt-6 first:mt-0"
        >
          {line.slice(2)}
        </h1>
      );
      continue;
    }

    if (line.startsWith("## ")) {
      renderedElements.push(
        <h2
          key={`h2-${i}`}
          id={line.slice(3).toLowerCase().replace(/[^a-z0-9]+/g, "-")}
          className="text-xl sm:text-2xl font-semibold tracking-tight text-[var(--gh-text)] pb-1.5 mb-3 border-b border-[var(--gh-border)] mt-8"
        >
          {line.slice(3)}
        </h2>
      );
      continue;
    }

    if (line.startsWith("### ")) {
      renderedElements.push(
        <h3
          key={`h3-${i}`}
          id={line.slice(4).toLowerCase().replace(/[^a-z0-9]+/g, "-")}
          className="text-base sm:text-lg font-semibold tracking-tight text-[var(--gh-text)] mb-2 mt-6"
        >
          {line.slice(4)}
        </h3>
      );
      continue;
    }

    // Unordered lists
    if (line.trim().startsWith("- ") || line.trim().startsWith("• ")) {
      const text = line.trim().replace(/^[-•]\s/, "");
      renderedElements.push(
        <li key={`li-${i}`} className="text-sm leading-relaxed text-[var(--gh-text)] ml-4 list-disc my-1">
          {formatInline(text)}
        </li>
      );
      continue;
    }

    // Empty lines
    if (!line.trim()) {
      continue;
    }

    // Standard paragraphs
    renderedElements.push(
      <p key={`p-${i}`} className="text-sm leading-relaxed text-[var(--gh-text)] my-2.5">
        {formatInline(line)}
      </p>
    );
  }

  // Flush any open table
  if (inTable && tableHeader.length > 0) {
    renderedElements.push(
      <div key="table-flush" className="my-5 overflow-x-auto rounded-md border border-[var(--gh-border)]">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[var(--gh-canvas-subtle)] border-b border-[var(--gh-border)]">
              {tableHeader.map((th, thIdx) => (
                <th key={thIdx} className="py-2.5 px-3.5 font-semibold text-[var(--gh-text)]">
                  {formatInline(th)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--gh-border)]">
            {tableRows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-[var(--gh-canvas-subtle)] transition-colors">
                {row.map((td, tdIdx) => (
                  <td key={tdIdx} className="py-2 px-3.5 text-[var(--gh-text)]">
                    {formatInline(td)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return <div className="markdown-body space-y-2">{renderedElements}</div>;
}

// Inline formatting helper for bold, code, markdown links
function formatInline(str: string): React.ReactNode {
  // Regex to split by markdown link [title](url), `code`, or **bold**
  const regex = /(\[[^\]]+\]\([^)]+\)|`[^`]+`|\*\*[^*]+\*\*)/g;
  const parts = str.split(regex);

  return parts.map((part, index) => {
    // Check markdown link [title](url)
    if (part.startsWith("[") && part.includes("](") && part.endsWith(")")) {
      const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (match) {
        const [, title, url] = match;
        const isExternal = url.startsWith("http");
        return (
          <a
            key={index}
            href={url}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noreferrer" : undefined}
            className="text-[var(--gh-accent)] hover:underline inline-flex items-center gap-0.5"
          >
            <span>{title}</span>
            {isExternal && <ExternalLink className="w-2.5 h-2.5 ml-0.5 inline opacity-70" />}
          </a>
        );
      }
    }

    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={index}>
          {part.slice(1, -1)}
        </code>
      );
    }

    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold text-[var(--gh-text)]">
          {part.slice(2, -2)}
        </strong>
      );
    }

    return part;
  });
}

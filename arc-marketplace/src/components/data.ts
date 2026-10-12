import { AssetClass, FilterKey } from "./types";

export const DEFAULT_ARCNANO_POOL = "0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca";

export const ASSET_CLASSES: AssetClass[] = [
  {
    id: "mcp",
    filterKey: "MCP",
    title: "MCP Servers",
    subtext: "Standard API",
    count: 0,
    icon: "layers",
    isDark: false,
  },
  {
    id: "subagents",
    filterKey: "Sub-Agents",
    title: "Sub-Agents",
    subtext: "Workforce",
    count: 0,
    icon: "bot",
    isDark: false,
  },
  {
    id: "compute",
    filterKey: "Compute",
    title: "Compute & Quotas",
    subtext: "Hardware",
    count: 0,
    icon: "cpu",
    isDark: false,
  },
  {
    id: "feeds",
    filterKey: "Feeds",
    title: "Real-Time Feeds",
    subtext: "Streaming",
    count: 0,
    icon: "database",
    isDark: false,
  },
  {
    id: "trust",
    filterKey: "Security",
    title: "Trust & Governance",
    subtext: "Verification",
    count: 0,
    icon: "shield",
    isDark: true,
  },
];

export const FILTER_CHIPS: { label: string; key: FilterKey }[] = [
  { label: "All", key: "All" },
  { label: "MCP", key: "MCP" },
  { label: "Sub-Agents", key: "Sub-Agents" },
  { label: "Compute", key: "Compute" },
  { label: "Feeds", key: "Feeds" },
  { label: "Security", key: "Security" },
];

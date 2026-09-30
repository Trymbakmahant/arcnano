export interface DemoTxRecord {
  hash: string;
  block: number;
  gasUsed: string;
  method: string;
  commitment?: string;
  nullifier?: string;
  recipient?: string;
  amount?: string;
  explorerUrl: string;
  timestamp: number;
}

export interface DemoState {
  latestDeposit: DemoTxRecord | null;
  latestSpend: DemoTxRecord | null;
  totalExecutions: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __arcnano_demo_state__: DemoState | undefined;
}

export function getDemoState(): DemoState {
  if (!globalThis.__arcnano_demo_state__) {
    globalThis.__arcnano_demo_state__ = {
      latestDeposit: null,
      latestSpend: null,
      totalExecutions: 0,
    };
  }
  return globalThis.__arcnano_demo_state__;
}

export function recordLiveTransactions(deposit: DemoTxRecord, spend: DemoTxRecord) {
  const state = getDemoState();
  state.latestDeposit = deposit;
  state.latestSpend = spend;
  state.totalExecutions += 1;
}

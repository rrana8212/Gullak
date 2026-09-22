import { useLayoutEffect, type ReactNode } from "react";
import { useExpenseStore } from "@/lib/store";
import type { Transaction } from "@/lib/types";

function loadFromStorage() {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem("hisab-ledger");
    if (!raw) return;
    const parsed = JSON.parse(raw) as {
      state?: { transactions?: Transaction[]; initialized?: boolean };
    };
    const state = parsed.state;
    if (!Array.isArray(state?.transactions)) return;
    useExpenseStore.setState({
      transactions: state.transactions,
      initialized: Boolean(state.initialized),
    });
  } catch {
    localStorage.removeItem("hisab-ledger");
  }
}

export function HydrateStore({ children }: { children: ReactNode }) {
  useLayoutEffect(() => {
    loadFromStorage();
  }, []);
  return children;
}

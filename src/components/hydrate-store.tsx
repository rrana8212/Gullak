import { useLayoutEffect, type ReactNode } from "react";
import { EMPTY_BILLING, EMPTY_LOAN, type CardEntry, type LoanState } from "@/lib/accounts";
import { useExpenseStore } from "@/lib/store";
import type { Transaction } from "@/lib/types";

function loadFromStorage() {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem("hisab-ledger");
    if (!raw) return;
    const parsed = JSON.parse(raw) as {
      state?: {
        transactions?: Transaction[];
        initialized?: boolean;
        cardEntries?: CardEntry[];
        billingDates?: Partial<Record<CardEntry["accountId"], string>>;
        loan?: Partial<LoanState>;
      };
    };
    const state = parsed.state;
    if (!state) return;
    useExpenseStore.setState({
      ...(Array.isArray(state.transactions)
        ? { transactions: state.transactions, initialized: Boolean(state.initialized) }
        : {}),
      cardEntries: Array.isArray(state.cardEntries) ? state.cardEntries : [],
      billingDates: { ...EMPTY_BILLING, ...state.billingDates },
      loan: { ...EMPTY_LOAN, ...state.loan },
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

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  EMPTY_BILLING,
  EMPTY_LOAN,
  type CardEntry,
  type CardEntryType,
  type CardId,
  type LoanState,
} from "./accounts";
import { monthKeyFromDate } from "./format";
import { buildDemoTransactions } from "./seed";
import type { CategoryId, Transaction, TxType } from "./types";

export type SheetState =
  | { mode: "closed" }
  | { mode: "create"; type?: TxType }
  | { mode: "edit"; id: string };

interface ExpenseState {
  transactions: Transaction[];
  initialized: boolean;
  monthKey: string;
  sheet: SheetState;
  cardEntries: CardEntry[];
  billingDates: Record<CardId, string>;
  loan: LoanState;
  hydrateDemo: () => void;
  restoreSample: () => void;
  setMonthKey: (monthKey: string) => void;
  openCreate: (type?: TxType) => void;
  openEdit: (id: string) => void;
  closeSheet: () => void;
  addTransaction: (input: {
    type: TxType;
    amount: number;
    category: CategoryId;
    note: string;
    date: string;
  }) => void;
  updateTransaction: (
    id: string,
    input: {
      type: TxType;
      amount: number;
      category: CategoryId;
      note: string;
      date: string;
    },
  ) => void;
  removeTransaction: (id: string) => void;
  clearAll: () => void;
  setBillingDate: (accountId: CardId, date: string) => void;
  addCardEntry: (input: {
    accountId: CardId;
    type: CardEntryType;
    amount: number;
    note: string;
    date: string;
  }) => void;
  updateCardEntry: (
    id: string,
    input: { type: CardEntryType; amount: number; note: string; date: string },
  ) => void;
  removeCardEntry: (id: string) => void;
  setLoan: (loan: LoanState) => void;
}

function newId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `tx-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useExpenseStore = create<ExpenseState>()(
  persist(
    (set, get) => ({
      transactions: buildDemoTransactions(),
      initialized: true,
      monthKey: monthKeyFromDate(new Date()),
      sheet: { mode: "closed" },
      cardEntries: [],
      billingDates: { ...EMPTY_BILLING },
      loan: { ...EMPTY_LOAN },
      hydrateDemo: () => {
        const { initialized, transactions } = get();
        if (initialized || transactions.length > 0) {
          if (!initialized) set({ initialized: true });
          return;
        }
        set({
          transactions: buildDemoTransactions(),
          initialized: true,
        });
      },
      restoreSample: () =>
        set({
          transactions: buildDemoTransactions(),
          initialized: true,
          monthKey: monthKeyFromDate(new Date()),
          sheet: { mode: "closed" },
        }),
      setMonthKey: (monthKey) => set({ monthKey }),
      openCreate: (type) => set({ sheet: { mode: "create", type } }),
      openEdit: (id) => set({ sheet: { mode: "edit", id } }),
      closeSheet: () => set({ sheet: { mode: "closed" } }),
      addTransaction: (input) => {
        const tx: Transaction = {
          id: newId(),
          ...input,
          createdAt: Date.now(),
        };
        set({
          transactions: [tx, ...get().transactions],
          initialized: true,
          sheet: { mode: "closed" },
        });
      },
      updateTransaction: (id, input) => {
        set({
          transactions: get().transactions.map((tx) =>
            tx.id === id ? { ...tx, ...input } : tx,
          ),
          sheet: { mode: "closed" },
        });
      },
      removeTransaction: (id) => {
        set({
          transactions: get().transactions.filter((tx) => tx.id !== id),
          sheet: { mode: "closed" },
        });
      },
      clearAll: () => set({ transactions: [], initialized: true, sheet: { mode: "closed" } }),
      setBillingDate: (accountId, date) =>
        set({ billingDates: { ...get().billingDates, [accountId]: date } }),
      addCardEntry: (input) => {
        const entry: CardEntry = { id: newId(), ...input, createdAt: Date.now() };
        set({ cardEntries: [entry, ...get().cardEntries] });
      },
      updateCardEntry: (id, input) => {
        set({
          cardEntries: get().cardEntries.map((entry) =>
            entry.id === id ? { ...entry, ...input } : entry,
          ),
        });
      },
      removeCardEntry: (id) => {
        set({ cardEntries: get().cardEntries.filter((entry) => entry.id !== id) });
      },
      setLoan: (loan) => set({ loan }),
    }),
    {
      name: "hisab-ledger",
      skipHydration: true,
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? noopStorage : localStorage,
      ),
      partialize: (state) => ({
        transactions: state.transactions,
        initialized: state.initialized,
        cardEntries: state.cardEntries,
        billingDates: state.billingDates,
        loan: state.loan,
      }),
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<ExpenseState>;
        return {
          ...current,
          ...saved,
          billingDates: { ...EMPTY_BILLING, ...saved.billingDates },
          loan: { ...EMPTY_LOAN, ...saved.loan },
          cardEntries: saved.cardEntries ?? [],
        };
      },
    },
  ),
);

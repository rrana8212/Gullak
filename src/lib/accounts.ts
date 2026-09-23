export const CARD_ACCOUNTS = [
  { id: "hdfc", name: "HDFC CC", hint: "HDFC credit card" },
  { id: "indus-visa", name: "Indus Visa CC", hint: "IndusInd Visa" },
  { id: "indus-rupay", name: "Indus RuPay", hint: "IndusInd RuPay" },
] as const;

export type CardId = (typeof CARD_ACCOUNTS)[number]["id"];
export type AccountId = CardId | "axis";
export type CardEntryType = "out" | "in" | "paid";

export interface CardEntry {
  id: string;
  accountId: CardId;
  type: CardEntryType;
  amount: number;
  note: string;
  date: string;
  createdAt: number;
}

export interface LoanState {
  accountNumber: string;
  total: number;
  paid: number;
}

export const EMPTY_LOAN: LoanState = { accountNumber: "", total: 0, paid: 0 };

export const EMPTY_BILLING: Record<CardId, string> = {
  hdfc: "",
  "indus-visa": "",
  "indus-rupay": "",
};

export function isCardId(id: string): id is CardId {
  return CARD_ACCOUNTS.some((account) => account.id === id);
}

export function cardById(id: string) {
  return CARD_ACCOUNTS.find((account) => account.id === id);
}

export interface CardSummary {
  outgoing: number;
  incoming: number;
  totalOutstanding: number;
  paid: number;
  balance: number;
}

export function summarizeCard(entries: CardEntry[]): CardSummary {
  let outgoing = 0;
  let incoming = 0;
  let paid = 0;
  for (const entry of entries) {
    if (entry.type === "out") outgoing += entry.amount;
    else if (entry.type === "in") incoming += entry.amount;
    else paid += entry.amount;
  }
  outgoing = roundMoney(outgoing);
  incoming = roundMoney(incoming);
  paid = roundMoney(paid);
  const totalOutstanding = roundMoney(Math.max(0, outgoing - incoming));
  const balance = roundMoney(totalOutstanding - paid);
  return { outgoing, incoming, totalOutstanding, paid, balance };
}

export function loanBalance(loan: LoanState): number {
  return roundMoney(loan.total - loan.paid);
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function parseMoney(raw: string): number | null {
  const cleaned = raw.replace(/,/g, "").trim();
  if (!cleaned) return 0;
  const value = Number(cleaned);
  if (!Number.isFinite(value) || value < 0) return null;
  return roundMoney(value);
}

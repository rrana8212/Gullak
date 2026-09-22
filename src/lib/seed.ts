import { toISODate } from "./format";
import type { Transaction } from "./types";

function id(n: number): string {
  return `demo-${n.toString(16).padStart(4, "0")}`;
}

function onDay(year: number, monthIndex: number, day: number): string {
  return toISODate(new Date(year, monthIndex, day));
}

export function buildDemoTransactions(now = new Date()): Transaction[] {
  const y = now.getFullYear();
  const m = now.getMonth();
  const createdAt = now.getTime();

  const rows: Omit<Transaction, "id" | "createdAt">[] = [
    { type: "in", amount: 72000, category: "salary", note: "Monthly salary", date: onDay(y, m, 1) },
    { type: "out", amount: 18500, category: "rent", note: "House rent", date: onDay(y, m, 2) },
    { type: "out", amount: 599, category: "bills", note: "Jio Fiber", date: onDay(y, m, 3) },
    { type: "out", amount: 2460, category: "groceries", note: "BigBasket weekly", date: onDay(y, m, 4) },
    { type: "out", amount: 340, category: "food", note: "Lunch — local thali", date: onDay(y, m, 5) },
    { type: "out", amount: 220, category: "travel", note: "Auto to market", date: onDay(y, m, 5) },
    { type: "out", amount: 649, category: "fun", note: "Streaming", date: onDay(y, m, 6) },
    { type: "out", amount: 180, category: "food", note: "Evening chai", date: onDay(y, m, 7) },
    { type: "out", amount: 3180, category: "shopping", note: "Home supplies", date: onDay(y, m, 8) },
    { type: "out", amount: 890, category: "health", note: "Pharmacy", date: onDay(y, m, 9) },
    { type: "in", amount: 9500, category: "freelance", note: "Design project", date: onDay(y, m, 10) },
    { type: "out", amount: 540, category: "food", note: "Dinner out", date: onDay(y, m, 11) },
    { type: "out", amount: 2100, category: "bills", note: "Electricity", date: onDay(y, m, 12) },
    { type: "out", amount: 1680, category: "groceries", note: "Vegetables & dairy", date: onDay(y, m, 13) },
    { type: "out", amount: 420, category: "travel", note: "Cab across town", date: onDay(y, m, 14) },
    { type: "out", amount: 1500, category: "health", note: "Gym", date: onDay(y, m, 15) },
    { type: "out", amount: 275, category: "food", note: "Breakfast", date: onDay(y, m, 16) },
    { type: "out", amount: 4300, category: "shopping", note: "Clothes", date: onDay(y, m, 17) },
    { type: "out", amount: 1990, category: "groceries", note: "Monthly staples", date: onDay(y, m, 19) },
    { type: "out", amount: 310, category: "food", note: "Office lunch", date: onDay(y, m, 20) },
    { type: "in", amount: 2500, category: "transfer", note: "Refund", date: onDay(y, m, 21) },
    { type: "out", amount: 780, category: "fun", note: "Movie night", date: onDay(y, m, 22) },
    { type: "out", amount: 145, category: "food", note: "Coffee", date: onDay(y, m, 23) },
  ];

  const prev = new Date(y, m - 1, 1);
  const py = prev.getFullYear();
  const pm = prev.getMonth();

  rows.push(
    { type: "in", amount: 72000, category: "salary", note: "Monthly salary", date: onDay(py, pm, 1) },
    { type: "out", amount: 18500, category: "rent", note: "House rent", date: onDay(py, pm, 2) },
    { type: "out", amount: 2280, category: "bills", note: "Electricity", date: onDay(py, pm, 8) },
    { type: "out", amount: 4120, category: "groceries", note: "BigBasket", date: onDay(py, pm, 11) },
    { type: "in", amount: 7000, category: "freelance", note: "Weekend work", date: onDay(py, pm, 16) },
    { type: "out", amount: 2650, category: "travel", note: "Train tickets", date: onDay(py, pm, 20) },
    { type: "out", amount: 980, category: "food", note: "Family dinner", date: onDay(py, pm, 24) },
    { type: "out", amount: 599, category: "bills", note: "Jio Fiber", date: onDay(py, pm, 28) },
  );

  const today = now.getDate();
  return rows
    .filter((row) => {
      const d = new Date(`${row.date}T00:00:00`);
      return d.getTime() <= new Date(y, m, today).getTime();
    })
    .map((row, index) => ({
      ...row,
      id: id(index + 1),
      createdAt: createdAt - (rows.length - index) * 36_000_000,
    }));
}

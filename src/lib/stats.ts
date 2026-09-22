import {
  addDaysISO,
  endOfMonth,
  monthKeyFromISO,
  startOfMonth,
  toISODate,
  todayISO,
} from "./format";
import type { CategoryId, Transaction, TxType } from "./types";
import { CATEGORY_MAP } from "./types";

export interface MonthTotals {
  incoming: number;
  outgoing: number;
  net: number;
}

export function totalsFor(transactions: Transaction[], monthKey: string): MonthTotals {
  let incoming = 0;
  let outgoing = 0;
  for (const tx of transactions) {
    if (monthKeyFromISO(tx.date) !== monthKey) continue;
    if (tx.type === "in") incoming += tx.amount;
    else outgoing += tx.amount;
  }
  return { incoming, outgoing, net: incoming - outgoing };
}

export function transactionsInMonth(
  transactions: Transaction[],
  monthKey: string,
): Transaction[] {
  return transactions
    .filter((tx) => monthKeyFromISO(tx.date) === monthKey)
    .sort((a, b) => (a.date === b.date ? b.createdAt - a.createdAt : b.date.localeCompare(a.date)));
}

export interface DayPoint {
  date: string;
  label: string;
  incoming: number;
  outgoing: number;
}

export function lastSevenDaysSeries(
  transactions: Transaction[],
  monthKey: string,
): DayPoint[] {
  const today = todayISO();
  const monthEnd = toISODate(endOfMonth(monthKey));
  const monthStart = toISODate(startOfMonth(monthKey));
  const end = today < monthEnd && monthKeyFromISO(today) === monthKey ? today : monthEnd;
  const startCandidate = addDaysISO(end, -6);
  const start = startCandidate < monthStart ? monthStart : startCandidate;

  const points: DayPoint[] = [];
  for (let cursor = start; cursor <= end; cursor = addDaysISO(cursor, 1)) {
    const d = new Date(`${cursor}T00:00:00`);
    points.push({
      date: cursor,
      label: d.toLocaleDateString("en-IN", { weekday: "short" }),
      incoming: 0,
      outgoing: 0,
    });
  }

  const byDate = new Map(points.map((p) => [p.date, p]));
  for (const tx of transactions) {
    const point = byDate.get(tx.date);
    if (!point) continue;
    if (tx.type === "in") point.incoming += tx.amount;
    else point.outgoing += tx.amount;
  }
  return points;
}

export function monthWeekSeries(
  transactions: Transaction[],
  monthKey: string,
): DayPoint[] {
  const end = endOfMonth(monthKey);
  const weeks: DayPoint[] = [];
  let weekStart = 1;
  let index = 1;

  while (weekStart <= end.getDate()) {
    const weekEnd = Math.min(weekStart + 6, end.getDate());
    weeks.push({
      date: `${monthKey}-w${index}`,
      label: `W${index}`,
      incoming: 0,
      outgoing: 0,
    });
    for (const tx of transactions) {
      if (monthKeyFromISO(tx.date) !== monthKey) continue;
      const day = Number(tx.date.slice(8, 10));
      if (day < weekStart || day > weekEnd) continue;
      const bucket = weeks[weeks.length - 1];
      if (!bucket) continue;
      if (tx.type === "in") bucket.incoming += tx.amount;
      else bucket.outgoing += tx.amount;
    }
    weekStart += 7;
    index += 1;
  }

  return weeks;
}

export interface CategorySlice {
  id: CategoryId;
  label: string;
  type: TxType;
  amount: number;
}

export function categoryBreakdown(
  transactions: Transaction[],
  monthKey: string,
  type: TxType,
): CategorySlice[] {
  const sums = new Map<CategoryId, number>();
  for (const tx of transactions) {
    if (tx.type !== type || monthKeyFromISO(tx.date) !== monthKey) continue;
    sums.set(tx.category, (sums.get(tx.category) ?? 0) + tx.amount);
  }
  return [...sums.entries()]
    .map(([id, amount]) => ({
      id,
      label: CATEGORY_MAP[id]?.label ?? id,
      type,
      amount,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export interface MonthPoint {
  monthKey: string;
  label: string;
  incoming: number;
  outgoing: number;
}

export function trailingMonths(
  transactions: Transaction[],
  current: string,
  count = 6,
): MonthPoint[] {
  const [y, m] = current.split("-").map(Number);
  const points: MonthPoint[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date(y ?? 0, (m ?? 1) - 1 - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const totals = totalsFor(transactions, key);
    points.push({
      monthKey: key,
      label: d.toLocaleDateString("en-IN", { month: "short" }),
      incoming: totals.incoming,
      outgoing: totals.outgoing,
    });
  }
  const firstUsed = points.findIndex((p) => p.incoming > 0 || p.outgoing > 0);
  return firstUsed > 0 ? points.slice(firstUsed) : points;
}

export interface DateGroup {
  date: string;
  items: Transaction[];
}

export function groupByDate(transactions: Transaction[]): DateGroup[] {
  const groups: DateGroup[] = [];
  for (const tx of transactions) {
    const last = groups[groups.length - 1];
    if (last && last.date === tx.date) last.items.push(tx);
    else groups.push({ date: tx.date, items: [tx] });
  }
  return groups;
}

import { useMemo } from "react";
import {
  categoryBreakdown,
  lastSevenDaysSeries,
  monthWeekSeries,
  totalsFor,
  trailingMonths,
  transactionsInMonth,
} from "./stats";
import { useExpenseStore } from "./store";

export function useMonthStats() {
  const transactions = useExpenseStore((s) => s.transactions);
  const monthKey = useExpenseStore((s) => s.monthKey);

  return useMemo(() => {
    const monthTx = transactionsInMonth(transactions, monthKey);
    const totals = totalsFor(transactions, monthKey);
    return {
      monthKey,
      transactions,
      monthTx,
      totals,
      week: lastSevenDaysSeries(transactions, monthKey),
      weeks: monthWeekSeries(transactions, monthKey),
      outCategories: categoryBreakdown(transactions, monthKey, "out"),
      inCategories: categoryBreakdown(transactions, monthKey, "in"),
      months: trailingMonths(transactions, monthKey, 6),
    };
  }, [transactions, monthKey]);
}

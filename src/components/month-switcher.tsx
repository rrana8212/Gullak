import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatMonthLabel, monthKeyFromDate, shiftMonth } from "@/lib/format";
import { useExpenseStore } from "@/lib/store";
import { Button } from "./ui/button";

export function MonthSwitcher() {
  const monthKey = useExpenseStore((s) => s.monthKey);
  const setMonthKey = useExpenseStore((s) => s.setMonthKey);
  const current = monthKeyFromDate(new Date());
  const nextDisabled = monthKey >= current;

  return (
    <div className="flex items-center justify-between gap-2">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Previous month"
        onClick={() => setMonthKey(shiftMonth(monthKey, -1))}
      >
        <ChevronLeft className="size-5" />
      </Button>
      <p className="font-display text-lg font-medium tracking-tight">
        {formatMonthLabel(monthKey)}
      </p>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Next month"
        disabled={nextDisabled}
        onClick={() => setMonthKey(shiftMonth(monthKey, 1))}
      >
        <ChevronRight className="size-5" />
      </Button>
    </div>
  );
}

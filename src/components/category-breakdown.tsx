import { formatINR } from "@/lib/format";
import type { CategorySlice } from "@/lib/stats";
import { cn } from "@/lib/utils";
import { CategoryIcon } from "./category-icon";

export function CategoryBreakdown({
  slices,
  emptyLabel,
}: {
  slices: CategorySlice[];
  emptyLabel: string;
}) {
  const max = slices[0]?.amount ?? 0;
  if (slices.length === 0) {
    return <p className="px-1 py-6 text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <ul className="space-y-3">
      {slices.map((slice) => {
        const width = max > 0 ? Math.max(8, (slice.amount / max) * 100) : 0;
        return (
          <li key={slice.id} className="flex items-center gap-3">
            <CategoryIcon id={slice.id} type={slice.type} className="size-9" />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <p className="truncate text-sm font-medium">{slice.label}</p>
                <p className="shrink-0 font-display text-sm tabular-nums tracking-tight">
                  {formatINR(slice.amount)}
                </p>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full",
                    slice.type === "in" ? "bg-income" : "bg-expense",
                  )}
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

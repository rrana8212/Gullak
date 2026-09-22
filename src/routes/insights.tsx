import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { ChartLegend, DualBarChart } from "@/components/charts";
import { CategoryBreakdown } from "@/components/category-breakdown";
import { MonthSwitcher } from "@/components/month-switcher";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { formatINR } from "@/lib/format";
import { useExpenseStore } from "@/lib/store";
import type { TxType } from "@/lib/types";
import { useMonthStats } from "@/lib/use-month-stats";

export const Route = createFileRoute("/insights")({ component: InsightsPage });

function InsightsPage() {
  const { totals, weeks, months, outCategories, inCategories } = useMonthStats();
  const [catType, setCatType] = useState<TxType>("out");
  const restoreSample = useExpenseStore((s) => s.restoreSample);
  const clearAll = useExpenseStore((s) => s.clearAll);
  const slices = catType === "out" ? outCategories : inCategories;
  const kept =
    totals.incoming > 0 ? Math.round((Math.max(totals.net, 0) / totals.incoming) * 100) : 0;

  return (
    <main className="px-5 pt-7 pb-6">
      <header>
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Overview
        </p>
        <h1 className="mt-1 font-display text-3xl font-medium tracking-tight">Insights</h1>
        <div className="mt-3">
          <MonthSwitcher />
        </div>
      </header>

      <section className="mt-5 grid grid-cols-2 gap-3">
        <article className="rounded-2xl bg-card p-4 shadow-card">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Kept
          </p>
          <p className="mt-2 font-display text-3xl font-medium tracking-tight tabular-nums">
            {kept}%
          </p>
          <p className="mt-1 text-xs text-muted-foreground">of incoming still in hand</p>
        </article>
        <article className="rounded-2xl bg-card p-4 shadow-card">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Net
          </p>
          <p className="mt-2 font-display text-2xl font-medium tracking-tight tabular-nums">
            {formatINR(totals.net)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">this month</p>
        </article>
      </section>

      <section className="mt-4 rounded-2xl bg-card p-4 shadow-card">
        <h2 className="font-display text-lg font-medium tracking-tight">By week</h2>
        <div className="mt-1 flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">This month, in rupees</p>
          <ChartLegend />
        </div>
        <div className="mt-3 overflow-hidden">
          <DualBarChart data={weeks} showAxis heightClass="h-52" />
        </div>
      </section>

      <section className="mt-4 rounded-2xl bg-card p-4 shadow-card">
        <h2 className="font-display text-lg font-medium tracking-tight">Trend</h2>
        <p className="mt-1 text-xs text-muted-foreground">Last six months</p>
        <div className="mt-3 overflow-hidden">
          <DualBarChart data={months} showAxis heightClass="h-48" />
        </div>
      </section>

      <section className="mt-4 rounded-2xl bg-card p-4 shadow-card">
        <h2 className="font-display text-lg font-medium tracking-tight">Categories</h2>
        <div className="mt-3">
          <Segmented
            ariaLabel="Category type"
            value={catType}
            onChange={setCatType}
            options={[
              { value: "out", label: "Outgoing" },
              { value: "in", label: "Incoming" },
            ]}
          />
        </div>
        <div className="mt-4">
          <CategoryBreakdown
            slices={slices}
            emptyLabel={
              catType === "out" ? "No spending to break down." : "No incoming to break down."
            }
          />
        </div>
      </section>

      <section className="mt-6 px-1 pb-4">
        <p className="text-xs text-muted-foreground">
          Entries stay on this device. Clearing the ledger cannot be undone.
        </p>
        <div className="mt-3 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              restoreSample();
              toast("Sample ledger loaded");
            }}
          >
            Load sample
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              clearAll();
              toast("Ledger cleared");
            }}
          >
            Clear all
          </Button>
        </div>
      </section>
    </main>
  );
}

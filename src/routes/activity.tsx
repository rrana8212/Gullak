import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { List } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { MonthSwitcher } from "@/components/month-switcher";
import { TransactionRow } from "@/components/transaction-row";
import { Segmented } from "@/components/ui/segmented";
import { formatINR, formatRelativeDay } from "@/lib/format";
import { groupByDate } from "@/lib/stats";
import { useExpenseStore } from "@/lib/store";
import type { TxType } from "@/lib/types";
import { useMonthStats } from "@/lib/use-month-stats";

export const Route = createFileRoute("/activity")({ component: ActivityPage });

type Filter = "all" | TxType;

function ActivityPage() {
  const { monthTx, totals } = useMonthStats();
  const openCreate = useExpenseStore((s) => s.openCreate);
  const openEdit = useExpenseStore((s) => s.openEdit);
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(
    () => (filter === "all" ? monthTx : monthTx.filter((tx) => tx.type === filter)),
    [filter, monthTx],
  );
  const groups = useMemo(() => groupByDate(filtered), [filtered]);

  return (
    <main className="px-5 pt-7">
      <header>
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Ledger
        </p>
        <h1 className="mt-1 font-display text-3xl font-medium tracking-tight">Activity</h1>
        <div className="mt-3">
          <MonthSwitcher />
        </div>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {formatINR(totals.incoming)} in · {formatINR(totals.outgoing)} out
        </p>
      </header>

      <div className="mt-5">
        <Segmented
          ariaLabel="Filter entries"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All" },
            { value: "in", label: "Incoming" },
            { value: "out", label: "Outgoing" },
          ]}
        />
      </div>

      {groups.length === 0 ? (
        <div className="mt-4 rounded-2xl bg-card shadow-card">
          <EmptyState
            icon={List}
            title={filter === "all" ? "Nothing this month" : "No matching entries"}
            body="New entries show up here, grouped by day."
            actionLabel="Add entry"
            onAction={() => openCreate(filter === "all" ? undefined : filter)}
          />
        </div>
      ) : (
        <div className="mt-5 space-y-5 pb-4">
          {groups.map((group) => (
            <section key={group.date}>
              <h2 className="px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {formatRelativeDay(group.date)}
              </h2>
              <ul className="mt-2 overflow-hidden rounded-2xl bg-card shadow-card">
                {group.items.map((tx) => (
                  <li key={tx.id} className="border-b border-border last:border-b-0">
                    <TransactionRow tx={tx} onClick={() => openEdit(tx.id)} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}

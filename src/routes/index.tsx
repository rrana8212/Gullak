import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, CreditCard, Landmark, Wallet } from "lucide-react";
import { ChartLegend, DualBarChart } from "@/components/charts";
import { EmptyState } from "@/components/empty-state";
import { MonthSwitcher } from "@/components/month-switcher";
import { TotalsStrip } from "@/components/totals-strip";
import { TransactionRow } from "@/components/transaction-row";
import { CARD_ACCOUNTS, loanBalance, summarizeCard } from "@/lib/accounts";
import { formatINR, greetingFor } from "@/lib/format";
import { useExpenseStore } from "@/lib/store";
import { useMonthStats } from "@/lib/use-month-stats";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { monthTx, totals, week } = useMonthStats();
  const openCreate = useExpenseStore((s) => s.openCreate);
  const openEdit = useExpenseStore((s) => s.openEdit);
  const recent = monthTx.slice(0, 6);
  const netPositive = totals.net >= 0;

  return (
    <main className="px-5 pt-7">
      <header>
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {greetingFor()}
        </p>
        <h1 className="mt-1 font-display text-3xl font-medium tracking-tight">Hisab</h1>
        <div className="mt-3">
          <MonthSwitcher />
        </div>
      </header>

      <section className="mt-5 rounded-2xl bg-primary px-5 py-5 text-primary-foreground shadow-fab">
        <p className="text-xs font-medium tracking-wide text-primary-foreground/70 uppercase">
          Net this month
        </p>
        <p className="mt-2 font-display text-4xl font-medium tracking-tight tabular-nums">
          {formatINR(totals.net)}
        </p>
        <p className="mt-2 text-sm text-primary-foreground/70">
          {netPositive
            ? "Incoming is ahead of spending"
            : "Spending is ahead of incoming"}
        </p>
      </section>

      <section className="mt-4">
        <TotalsStrip
          incoming={totals.incoming}
          outgoing={totals.outgoing}
          onIncoming={() => openCreate("in")}
          onOutgoing={() => openCreate("out")}
        />
      </section>

      <section className="mt-4 rounded-2xl bg-card p-4 shadow-card">
        <h2 className="font-display text-lg font-medium tracking-tight">This week</h2>
        <div className="mt-1 flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">Incoming vs outgoing</p>
          <ChartLegend />
        </div>
        <div className="mt-3 overflow-hidden">
          <DualBarChart data={week} />
        </div>
      </section>

      <section className="mt-4 overflow-hidden rounded-2xl bg-card shadow-card">
        <div className="flex items-center justify-between px-4 pt-4 pb-1">
          <h2 className="font-display text-lg font-medium tracking-tight">Cards & loan</h2>
          <Link
            to="/accounts"
            className="inline-flex min-h-11 items-center gap-0.5 text-sm font-medium text-muted-foreground"
          >
            All
            <ChevronRight className="size-4" />
          </Link>
        </div>
        <AccountPreview />
      </section>

      <section className="mt-4 overflow-hidden rounded-2xl bg-card shadow-card">
        <div className="flex items-center justify-between px-4 pt-4 pb-1">
          <h2 className="font-display text-lg font-medium tracking-tight">Recent</h2>
          <Link
            to="/activity"
            className="inline-flex min-h-11 items-center gap-0.5 text-sm font-medium text-muted-foreground"
          >
            See all
            <ChevronRight className="size-4" />
          </Link>
        </div>
        {recent.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="No entries yet"
            body="Add incoming or outgoing money to start this month’s ledger."
            actionLabel="Add entry"
            onAction={() => openCreate()}
          />
        ) : (
          <ul className="divide-y divide-border pb-1">
            {recent.map((tx) => (
              <li key={tx.id}>
                <TransactionRow tx={tx} onClick={() => openEdit(tx.id)} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function AccountPreview() {
  const cardEntries = useExpenseStore((s) => s.cardEntries);
  const loan = useExpenseStore((s) => s.loan);

  return (
    <ul className="pb-1">
      {CARD_ACCOUNTS.map((account) => {
        const summary = summarizeCard(
          cardEntries.filter((entry) => entry.accountId === account.id),
        );
        return (
          <li key={account.id} className="border-t border-border">
            <Link
              to="/accounts/$id"
              params={{ id: account.id }}
              className="flex min-h-14 items-center gap-3 px-4 py-3"
            >
              <CreditCard className="size-4 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{account.name}</span>
              <span className="font-display text-sm font-medium tabular-nums">
                {formatINR(summary.balance)}
              </span>
            </Link>
          </li>
        );
      })}
      <li className="border-t border-border">
        <Link
          to="/accounts/$id"
          params={{ id: "axis" }}
          className="flex min-h-14 items-center gap-3 px-4 py-3"
        >
          <Landmark className="size-4 text-muted-foreground" />
          <span className="min-w-0 flex-1 truncate text-sm font-medium">Axis Bank loan</span>
          <span className="font-display text-sm font-medium tabular-nums">
            {formatINR(loanBalance(loan))}
          </span>
        </Link>
      </li>
    </ul>
  );
}

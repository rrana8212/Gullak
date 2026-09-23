import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { CardEntrySheet } from "@/components/card-entry-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  cardById,
  loanBalance,
  parseMoney,
  summarizeCard,
  type CardEntry,
  type CardEntryType,
  type CardId,
} from "@/lib/accounts";
import { formatINR, formatRelativeDay } from "@/lib/format";
import { useExpenseStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/accounts_/$id")({ component: AccountDetail });

function AccountDetail() {
  const { id } = Route.useParams();
  if (id === "axis") return <LoanPage />;
  const card = cardById(id);
  if (!card) return <Missing />;
  return <CardPage accountId={card.id} name={card.name} />;
}

function Missing() {
  return (
    <main className="px-5 pt-7">
      <Back />
      <h1 className="mt-4 font-display text-3xl font-medium">Account not found</h1>
    </main>
  );
}

function CardPage({ accountId, name }: { accountId: CardId; name: string }) {
  const entries = useExpenseStore((s) => s.cardEntries);
  const billingDate = useExpenseStore((s) => s.billingDates[accountId] ?? "");
  const setBillingDate = useExpenseStore((s) => s.setBillingDate);
  const mine = useMemo(
    () => entries.filter((entry) => entry.accountId === accountId),
    [entries, accountId],
  );
  const summary = useMemo(() => summarizeCard(mine), [mine]);
  const [sheet, setSheet] = useState<
    { open: false } | { open: true; entry?: CardEntry; preset?: CardEntryType }
  >({ open: false });

  return (
    <main className="px-5 pt-7 pb-6">
      <Back />
      <h1 className="mt-3 font-display text-3xl font-medium tracking-tight">{name}</h1>

      <section className="mt-5 rounded-2xl bg-primary px-5 py-5 text-primary-foreground shadow-fab">
        <p className="text-xs font-medium tracking-wide text-primary-foreground/70 uppercase">
          Balance outstanding
        </p>
        <p className="mt-2 font-display text-4xl font-medium tracking-tight tabular-nums">
          {formatINR(summary.balance)}
        </p>
        <p className="mt-2 text-sm text-primary-foreground/70">
          {formatINR(summary.totalOutstanding)} outstanding · {formatINR(summary.paid)} paid
        </p>
      </section>

      <section className="mt-4 grid grid-cols-2 gap-3">
        <Stat label="Outgoing" value={summary.outgoing} tone="expense" />
        <Stat label="Incoming" value={summary.incoming} tone="income" />
        <Stat label="Total outstanding" value={summary.totalOutstanding} />
        <Stat label="Paid amount" value={summary.paid} tone="income" />
      </section>

      <section className="mt-4 rounded-2xl bg-card p-4 shadow-card">
        <Label htmlFor="billing">Billing date</Label>
        <Input
          id="billing"
          type="date"
          className="mt-1.5"
          value={billingDate}
          onChange={(event) => setBillingDate(accountId, event.target.value)}
        />
        <p className="mt-2 text-xs text-muted-foreground">
          The date this card’s bill is due. It stays on this phone.
        </p>
      </section>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Button variant="expense" onClick={() => setSheet({ open: true, preset: "out" })}>
          Spend
        </Button>
        <Button variant="secondary" onClick={() => setSheet({ open: true, preset: "in" })}>
          Refund
        </Button>
        <Button variant="income" onClick={() => setSheet({ open: true, preset: "paid" })}>
          Paid
        </Button>
      </div>

      <section className="mt-5">
        <h2 className="font-display text-lg font-medium tracking-tight">Entries</h2>
        {mine.length === 0 ? (
          <p className="mt-2 rounded-2xl bg-card px-4 py-6 text-sm text-muted-foreground shadow-card">
            No spends, refunds, or payments yet.
          </p>
        ) : (
          <ul className="mt-2 overflow-hidden rounded-2xl bg-card shadow-card">
            {mine.map((entry) => (
              <li key={entry.id} className="border-b border-border last:border-b-0">
                <button
                  type="button"
                  onClick={() => setSheet({ open: true, entry })}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {entry.note || labelFor(entry.type)}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {labelFor(entry.type)} · {formatRelativeDay(entry.date)}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "font-display text-base font-medium tabular-nums",
                      entry.type === "out" ? "text-expense" : "text-income",
                    )}
                  >
                    {entry.type === "out" ? "−" : "+"}
                    {formatINR(entry.amount)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <CardEntrySheet
        open={sheet.open}
        accountId={accountId}
        entry={sheet.open ? sheet.entry : undefined}
        preset={sheet.open ? sheet.preset : undefined}
        onClose={() => setSheet({ open: false })}
      />
    </main>
  );
}

function LoanPage() {
  const loan = useExpenseStore((s) => s.loan);
  const setLoan = useExpenseStore((s) => s.setLoan);
  const [total, setTotal] = useState(loan.total ? String(loan.total) : "");
  const [paid, setPaid] = useState(loan.paid ? String(loan.paid) : "");
  const [error, setError] = useState<string | null>(null);
  const hydrated = useRef(false);
  const remaining = loanBalance(loan);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    setTotal(loan.total ? String(loan.total) : "");
    setPaid(loan.paid ? String(loan.paid) : "");
  }, [loan.paid, loan.total]);

  function save(next: { accountNumber?: string; totalRaw?: string; paidRaw?: string }) {
    const totalValue =
      next.totalRaw !== undefined ? parseMoney(next.totalRaw) : loan.total;
    const paidValue = next.paidRaw !== undefined ? parseMoney(next.paidRaw) : loan.paid;
    if (totalValue == null || paidValue == null) {
      setError("Use a valid amount, or leave it blank for zero.");
      return;
    }
    setError(null);
    setLoan({
      accountNumber: (next.accountNumber ?? loan.accountNumber).trim(),
      total: totalValue,
      paid: paidValue,
    });
  }

  return (
    <main className="px-5 pt-7 pb-8">
      <Back />
      <p className="mt-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Axis Bank
      </p>
      <h1 className="mt-1 font-display text-3xl font-medium tracking-tight">Loan</h1>

      <section className="mt-5 rounded-2xl bg-primary px-5 py-5 text-primary-foreground shadow-fab">
        <p className="text-xs font-medium tracking-wide text-primary-foreground/70 uppercase">
          Balance remaining
        </p>
        <p className="mt-2 font-display text-4xl font-medium tracking-tight tabular-nums">
          {formatINR(remaining)}
        </p>
      </section>

      <form
        className="mt-4 space-y-4 rounded-2xl bg-card p-4 shadow-card"
        onSubmit={(event) => {
          event.preventDefault();
          save({});
        }}
      >
        <div>
          <Label htmlFor="loan-account">Loan account number</Label>
          <Input
            id="loan-account"
            className="mt-1.5"
            inputMode="numeric"
            autoComplete="off"
            placeholder="Account number"
            value={loan.accountNumber}
            onChange={(event) => save({ accountNumber: event.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="loan-total">Total loan amount</Label>
          <Input
            id="loan-total"
            className="mt-1.5"
            inputMode="decimal"
            placeholder="0"
            value={total}
            onChange={(event) => {
              setTotal(event.target.value);
              save({ totalRaw: event.target.value });
            }}
          />
        </div>
        <div>
          <Label htmlFor="loan-paid">Paid till now</Label>
          <Input
            id="loan-paid"
            className="mt-1.5"
            inputMode="decimal"
            placeholder="0"
            value={paid}
            onChange={(event) => {
              setPaid(event.target.value);
              save({ paidRaw: event.target.value });
            }}
          />
        </div>
        {error ? <p className="text-sm text-expense">{error}</p> : null}
      </form>
    </main>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "income" | "expense";
}) {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-card">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
      <p
        className={cn(
          "mt-2 font-display text-lg font-medium tabular-nums tracking-tight",
          tone === "income" && "text-income",
          tone === "expense" && "text-expense",
        )}
      >
        {formatINR(value)}
      </p>
    </div>
  );
}

function labelFor(type: CardEntryType): string {
  if (type === "out") return "Outgoing";
  if (type === "in") return "Incoming";
  return "Paid";
}

function Back() {
  return (
    <Link
      to="/accounts"
      className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-muted-foreground"
    >
      <ChevronLeft className="size-4" />
      Accounts
    </Link>
  );
}

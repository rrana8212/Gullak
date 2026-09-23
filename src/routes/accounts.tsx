import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, CreditCard, Landmark } from "lucide-react";
import { CARD_ACCOUNTS, loanBalance, summarizeCard } from "@/lib/accounts";
import { formatINR } from "@/lib/format";
import { useExpenseStore } from "@/lib/store";

export const Route = createFileRoute("/accounts")({ component: AccountsPage });

function AccountsPage() {
  const cardEntries = useExpenseStore((s) => s.cardEntries);
  const loan = useExpenseStore((s) => s.loan);
  const balance = loanBalance(loan);

  return (
    <main className="px-5 pt-7">
      <header>
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Cards and loan
        </p>
        <h1 className="mt-1 font-display text-3xl font-medium tracking-tight">Accounts</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Track each card’s bill and the Axis loan on its own.
        </p>
      </header>

      <ul className="mt-5 overflow-hidden rounded-2xl bg-card shadow-card">
        {CARD_ACCOUNTS.map((account) => {
          const summary = summarizeCard(
            cardEntries.filter((entry) => entry.accountId === account.id),
          );
          return (
            <li key={account.id} className="border-b border-border last:border-b-0">
              <Link
                to="/accounts/$id"
                params={{ id: account.id }}
                className="flex min-h-16 items-center gap-3 px-4 py-3"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-muted text-primary">
                  <CreditCard className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{account.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {account.hint}
                  </span>
                </span>
                <span className="text-right">
                  <span className="block font-display text-base font-medium tabular-nums">
                    {formatINR(summary.balance)}
                  </span>
                  <span className="block text-xs text-muted-foreground">Balance</span>
                </span>
                <ChevronRight className="size-4 text-faint" />
              </Link>
            </li>
          );
        })}
        <li>
          <Link
            to="/accounts/$id"
            params={{ id: "axis" }}
            className="flex min-h-16 items-center gap-3 px-4 py-3"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-muted text-primary">
              <Landmark className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">Axis Bank loan</span>
              <span className="block truncate text-xs text-muted-foreground">
                {loan.accountNumber || "Add account number"}
              </span>
            </span>
            <span className="text-right">
              <span className="block font-display text-base font-medium tabular-nums">
                {formatINR(balance)}
              </span>
              <span className="block text-xs text-muted-foreground">Remaining</span>
            </span>
            <ChevronRight className="size-4 text-faint" />
          </Link>
        </li>
      </ul>
    </main>
  );
}

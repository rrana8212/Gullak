import { Link, useRouterState } from "@tanstack/react-router";
import { BarChart3, List, Plus, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { useExpenseStore } from "@/lib/store";
import { TransactionSheet } from "./transaction-sheet";

const TABS = [
  { to: "/", label: "Home", icon: Wallet },
  { to: "/activity", label: "Activity", icon: List },
  { to: "/insights", label: "Insights", icon: BarChart3 },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const openCreate = useExpenseStore((s) => s.openCreate);
  const sheetOpen = useExpenseStore((s) => s.sheet.mode !== "closed");

  return (
    <div className="flex min-h-dvh justify-center bg-muted">
      <div className="relative flex min-h-dvh w-full max-w-phone flex-col overflow-x-hidden bg-background">
        <div className="flex-1 pb-28">{children}</div>

        <nav
          className={cn(
            "fixed bottom-0 left-1/2 z-40 w-full max-w-phone -translate-x-1/2 border-t border-border bg-nav px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 shadow-nav transition-opacity duration-150",
            sheetOpen && "pointer-events-none opacity-0",
          )}
          aria-label="Primary"
          aria-hidden={sheetOpen}
        >
          <div className="grid grid-cols-4 items-end">
            {TABS.slice(0, 2).map((tab) => (
              <NavLink key={tab.to} {...tab} active={pathname === tab.to} />
            ))}

            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => openCreate()}
                className="mb-0.5 flex size-14 -translate-y-4 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-fab transition-transform duration-150 ease-out active:scale-95"
                aria-label="Add entry"
              >
                <Plus className="size-6" strokeWidth={2.25} />
              </button>
            </div>

            {TABS[2] ? (
              <NavLink {...TABS[2]} active={pathname === TABS[2].to} />
            ) : null}
          </div>
        </nav>

        <TransactionSheet />
      </div>
    </div>
  );
}

function NavLink({
  to,
  label,
  icon: Icon,
  active,
}: {
  to: (typeof TABS)[number]["to"];
  label: string;
  icon: typeof Wallet;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "flex min-h-11 flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors duration-150",
        active ? "text-primary" : "text-faint",
      )}
      aria-current={active ? "page" : undefined}
    >
      <Icon className="size-5" strokeWidth={active ? 2.2 : 1.8} />
      {label}
    </Link>
  );
}

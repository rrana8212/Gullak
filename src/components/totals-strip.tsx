import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";

export function TotalsStrip({
  incoming,
  outgoing,
  onIncoming,
  onOutgoing,
}: {
  incoming: number;
  outgoing: number;
  onIncoming?: () => void;
  onOutgoing?: () => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <TotalCard
        label="Incoming"
        value={incoming}
        tone="income"
        icon={ArrowDownLeft}
        onClick={onIncoming}
      />
      <TotalCard
        label="Outgoing"
        value={outgoing}
        tone="expense"
        icon={ArrowUpRight}
        onClick={onOutgoing}
      />
    </div>
  );
}

function TotalCard({
  label,
  value,
  tone,
  icon: Icon,
  onClick,
}: {
  label: string;
  value: number;
  tone: "income" | "expense";
  icon: typeof ArrowDownLeft;
  onClick?: () => void;
}) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "min-w-0 rounded-2xl bg-card p-4 text-left shadow-card",
        onClick && "transition-transform duration-150 active:scale-[0.98]",
      )}
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        <span
          className={cn(
            "flex size-7 items-center justify-center rounded-md",
            tone === "income" ? "bg-income-soft text-income" : "bg-expense-soft text-expense",
          )}
        >
          <Icon className="size-3.5" strokeWidth={2.4} />
        </span>
        <span className="text-xs font-medium tracking-wide uppercase">{label}</span>
      </div>
      <p
        className={cn(
          "mt-3 font-display text-lg font-medium tracking-tight tabular-nums",
          tone === "income" ? "text-income" : "text-expense",
        )}
      >
        {formatINR(value)}
      </p>
    </Comp>
  );
}

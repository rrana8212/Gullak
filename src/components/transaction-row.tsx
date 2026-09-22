import { formatINR } from "@/lib/format";
import { CATEGORY_MAP, type Transaction } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CategoryIcon } from "./category-icon";

export function TransactionRow({
  tx,
  onClick,
}: {
  tx: Transaction;
  onClick?: () => void;
}) {
  const category = CATEGORY_MAP[tx.category];
  const title = tx.note.trim() || category?.label || "Entry";
  const Comp = onClick ? "button" : "div";
  const amount = formatINR(tx.amount);

  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-3 text-left",
        onClick && "transition-colors duration-150 hover:bg-muted/70 active:bg-muted",
      )}
    >
      <CategoryIcon id={tx.category} type={tx.type} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{category?.label}</p>
      </div>
      <p
        className={cn(
          "shrink-0 font-display text-base font-medium tabular-nums tracking-tight",
          tx.type === "in" ? "text-income" : "text-expense",
        )}
      >
        {tx.type === "in" ? `+${amount}` : `−${amount}`}
      </p>
    </Comp>
  );
}

import {
  ArrowLeftRight,
  Banknote,
  Briefcase,
  Bus,
  CircleEllipsis,
  Clapperboard,
  HeartPulse,
  House,
  Plus,
  ShoppingBag,
  ShoppingBasket,
  Utensils,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CategoryId, TxType } from "@/lib/types";

const ICONS: Record<CategoryId, LucideIcon> = {
  salary: Banknote,
  freelance: Briefcase,
  transfer: ArrowLeftRight,
  other_in: Plus,
  food: Utensils,
  groceries: ShoppingBasket,
  travel: Bus,
  rent: House,
  bills: Zap,
  shopping: ShoppingBag,
  health: HeartPulse,
  fun: Clapperboard,
  other_out: CircleEllipsis,
};

export function CategoryIcon({
  id,
  type,
  className,
}: {
  id: CategoryId;
  type: TxType;
  className?: string;
}) {
  const Icon = ICONS[id] ?? CircleEllipsis;
  return (
    <span
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-lg",
        type === "in" ? "bg-income-soft text-income" : "bg-expense-soft text-expense",
        className,
      )}
    >
      <Icon className="size-4" strokeWidth={2} />
    </span>
  );
}

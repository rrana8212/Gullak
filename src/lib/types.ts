export type TxType = "in" | "out";

export type CategoryId =
  | "salary"
  | "freelance"
  | "transfer"
  | "other_in"
  | "food"
  | "groceries"
  | "travel"
  | "rent"
  | "bills"
  | "shopping"
  | "health"
  | "fun"
  | "other_out";

export interface Transaction {
  id: string;
  type: TxType;
  amount: number;
  category: CategoryId;
  note: string;
  date: string;
  createdAt: number;
}

export interface CategoryDef {
  id: CategoryId;
  label: string;
  type: TxType;
}

export const CATEGORIES: CategoryDef[] = [
  { id: "salary", label: "Salary", type: "in" },
  { id: "freelance", label: "Freelance", type: "in" },
  { id: "transfer", label: "Transfer", type: "in" },
  { id: "other_in", label: "Other", type: "in" },
  { id: "food", label: "Food", type: "out" },
  { id: "groceries", label: "Groceries", type: "out" },
  { id: "travel", label: "Travel", type: "out" },
  { id: "rent", label: "Rent", type: "out" },
  { id: "bills", label: "Bills", type: "out" },
  { id: "shopping", label: "Shopping", type: "out" },
  { id: "health", label: "Health", type: "out" },
  { id: "fun", label: "Leisure", type: "out" },
  { id: "other_out", label: "Other", type: "out" },
];

export const CATEGORY_MAP: Record<CategoryId, CategoryDef> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<CategoryId, CategoryDef>;

export function categoriesFor(type: TxType): CategoryDef[] {
  return CATEGORIES.filter((c) => c.type === type);
}

export function defaultCategory(type: TxType): CategoryId {
  return type === "in" ? "salary" : "food";
}

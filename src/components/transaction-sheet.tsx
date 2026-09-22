import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { monthKeyFromISO, parseAmount, todayISO } from "@/lib/format";
import { useExpenseStore } from "@/lib/store";
import {
  categoriesFor,
  defaultCategory,
  type CategoryId,
  type TxType,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "./ui/drawer";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Segmented } from "./ui/segmented";

interface FormState {
  type: TxType;
  amount: string;
  category: CategoryId;
  note: string;
  date: string;
}

const emptyForm = (): FormState => ({
  type: "out",
  amount: "",
  category: defaultCategory("out"),
  note: "",
  date: todayISO(),
});

export function TransactionSheet() {
  const sheet = useExpenseStore((s) => s.sheet);
  const transactions = useExpenseStore((s) => s.transactions);
  const closeSheet = useExpenseStore((s) => s.closeSheet);
  const addTransaction = useExpenseStore((s) => s.addTransaction);
  const updateTransaction = useExpenseStore((s) => s.updateTransaction);
  const removeTransaction = useExpenseStore((s) => s.removeTransaction);
  const setMonthKey = useExpenseStore((s) => s.setMonthKey);

  const editing = sheet.mode === "edit" ? transactions.find((t) => t.id === sheet.id) : undefined;
  const open = sheet.mode !== "closed";
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sheet.mode === "closed") return;
    setError(null);
    if (sheet.mode === "edit") {
      const tx = transactions.find((t) => t.id === sheet.id);
      if (!tx) {
        closeSheet();
        return;
      }
      setForm({
        type: tx.type,
        amount: String(tx.amount),
        category: tx.category,
        note: tx.note,
        date: tx.date,
      });
      return;
    }
    const type = sheet.type ?? "out";
    setForm({
      type,
      amount: "",
      category: defaultCategory(type),
      note: "",
      date: todayISO(),
    });
  }, [sheet, transactions, closeSheet]);

  const cats = useMemo(() => categoriesFor(form.type), [form.type]);

  function setType(type: TxType) {
    setForm((prev) => ({
      ...prev,
      type,
      category: categoriesFor(type).some((c) => c.id === prev.category)
        ? prev.category
        : defaultCategory(type),
    }));
  }

  function submit() {
    const amount = parseAmount(form.amount);
    if (amount == null) {
      setError("Enter an amount greater than zero.");
      return;
    }
    if (!form.date) {
      setError("Pick a date.");
      return;
    }
    const payload = {
      type: form.type,
      amount,
      category: form.category,
      note: form.note.trim(),
      date: form.date,
    };
    if (sheet.mode === "edit" && editing) {
      updateTransaction(editing.id, payload);
      toast("Entry updated");
    } else {
      addTransaction(payload);
      toast(form.type === "in" ? "Incoming added" : "Outgoing added");
    }
    setMonthKey(monthKeyFromISO(form.date));
  }

  function onDelete() {
    if (sheet.mode !== "edit" || !editing) return;
    removeTransaction(editing.id);
    toast("Entry removed");
  }

  return (
    <Drawer
      open={open}
      onOpenChange={(next) => {
        if (!next) closeSheet();
      }}
    >
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{sheet.mode === "edit" ? "Edit entry" : "New entry"}</DrawerTitle>
          <DrawerDescription>Amounts are saved in Indian rupees.</DrawerDescription>
        </DrawerHeader>

        <form
          className="flex flex-col gap-4 overflow-y-auto px-5"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <Segmented
            ariaLabel="Entry type"
            value={form.type}
            onChange={setType}
            options={[
              { value: "in", label: "Incoming" },
              { value: "out", label: "Outgoing" },
            ]}
          />

          <div>
            <Label htmlFor="amount">Amount</Label>
            <div className="mt-1.5 flex h-14 items-center gap-2 rounded-lg bg-muted px-3 shadow-[inset_0_0_0_1px_var(--color-border)] focus-within:shadow-[inset_0_0_0_1.5px_var(--color-primary)]">
              <span className="font-display text-2xl text-muted-foreground">₹</span>
              <input
                id="amount"
                inputMode="decimal"
                autoComplete="off"
                placeholder="0"
                value={form.amount}
                onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                className="h-full w-full bg-transparent font-display text-2xl font-medium tabular-nums tracking-tight text-foreground outline-none placeholder:text-faint"
              />
            </div>
          </div>

          <div>
            <Label>Category</Label>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {cats.map((cat) => {
                const active = form.category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, category: cat.id }))}
                    className={cn(
                      "h-9 rounded-full px-3 text-sm font-medium transition-colors duration-150",
                      active
                        ? form.type === "in"
                          ? "bg-income text-primary-foreground"
                          : "bg-expense text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                className="mt-1.5"
                max={todayISO()}
                value={form.date}
                onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="note">Note</Label>
              <Input
                id="note"
                className="mt-1.5"
                placeholder="Optional"
                maxLength={80}
                value={form.note}
                onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
              />
            </div>
          </div>

          {error ? <p className="text-sm text-expense">{error}</p> : null}

          <DrawerFooter className="px-0 pb-5 pt-2">
            <Button type="submit" size="lg" className="w-full">
              {sheet.mode === "edit" ? "Save changes" : "Add entry"}
            </Button>
            {sheet.mode === "edit" ? (
              <Button type="button" variant="danger" onClick={onDelete}>
                Remove entry
              </Button>
            ) : null}
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}

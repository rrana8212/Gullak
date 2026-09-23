import { useEffect, useState } from "react";
import { toast } from "sonner";
import { parseMoney, type CardEntry, type CardEntryType } from "@/lib/accounts";
import { todayISO } from "@/lib/format";
import { useExpenseStore } from "@/lib/store";
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

const LABELS: Record<CardEntryType, string> = {
  out: "Outgoing",
  in: "Incoming",
  paid: "Paid",
};

export function CardEntrySheet({
  entry,
  accountId,
  preset,
  open,
  onClose,
}: {
  entry?: CardEntry;
  accountId: CardEntry["accountId"];
  preset?: CardEntryType;
  open: boolean;
  onClose: () => void;
}) {
  const addCardEntry = useExpenseStore((s) => s.addCardEntry);
  const updateCardEntry = useExpenseStore((s) => s.updateCardEntry);
  const removeCardEntry = useExpenseStore((s) => s.removeCardEntry);
  const [type, setType] = useState<CardEntryType>(preset ?? "out");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(todayISO());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (entry) {
      setType(entry.type);
      setAmount(String(entry.amount));
      setNote(entry.note);
      setDate(entry.date);
      return;
    }
    setType(preset ?? "out");
    setAmount("");
    setNote("");
    setDate(todayISO());
  }, [open, entry, preset]);

  function submit() {
    const parsed = parseMoney(amount);
    if (parsed == null || parsed <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }
    if (!date) {
      setError("Choose a date.");
      return;
    }
    const input = { type, amount: parsed, note: note.trim(), date };
    if (entry) {
      updateCardEntry(entry.id, input);
      toast("Entry updated");
    } else {
      addCardEntry({ accountId, ...input });
      toast(`${LABELS[type]} added`);
    }
    onClose();
  }

  return (
    <Drawer open={open} onOpenChange={(next) => !next && onClose()}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{entry ? "Edit entry" : "Add entry"}</DrawerTitle>
          <DrawerDescription>
            Outgoing is a spend. Incoming is a refund. Paid is money you paid toward the bill.
          </DrawerDescription>
        </DrawerHeader>
        <form
          className="flex flex-col gap-4 overflow-y-auto px-5"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <Segmented
            ariaLabel="Entry type"
            value={type}
            onChange={setType}
            options={[
              { value: "out", label: "Outgoing" },
              { value: "in", label: "Incoming" },
              { value: "paid", label: "Paid" },
            ]}
          />
          <div>
            <Label htmlFor="card-amount">Amount</Label>
            <div className="mt-1.5 flex h-14 items-center gap-2 rounded-lg bg-muted px-3 shadow-[inset_0_0_0_1px_var(--color-border)] focus-within:shadow-[inset_0_0_0_1.5px_var(--color-primary)]">
              <span className="font-display text-2xl text-muted-foreground">₹</span>
              <input
                id="card-amount"
                inputMode="decimal"
                autoComplete="off"
                placeholder="0"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="h-full w-full bg-transparent font-display text-2xl font-medium tabular-nums tracking-tight outline-none placeholder:text-faint"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="card-date">Date</Label>
              <Input
                id="card-date"
                type="date"
                className="mt-1.5"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="card-note">Note</Label>
              <Input
                id="card-note"
                className="mt-1.5"
                placeholder="Optional"
                maxLength={80}
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
            </div>
          </div>
          {error ? <p className="text-sm text-expense">{error}</p> : null}
          <DrawerFooter className="px-0">
            <Button type="submit">{entry ? "Save" : "Add"}</Button>
            {entry ? (
              <Button
                type="button"
                variant="danger"
                onClick={() => {
                  removeCardEntry(entry.id);
                  toast("Entry removed");
                  onClose();
                }}
              >
                Delete
              </Button>
            ) : (
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
            )}
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}

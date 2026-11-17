"use client";

import { useState, useTransition } from "react";
import { Handshake, X, ArrowRight } from "lucide-react";
import { recordSettlement } from "@/lib/actions";

interface Member {
  id: string;
  name: string;
}

interface Props {
  tripId: string;
  tripSlug: string;
  currency: string;
  members: Member[];
  initialFromId?: string;
  initialToId?: string;
  initialAmount?: number;
  triggerButton?: React.ReactNode;
}

export function RecordSettlementModal({
  tripId,
  tripSlug,
  currency,
  members,
  initialFromId,
  initialToId,
  initialAmount,
  triggerButton,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [fromMemberId, setFromMemberId] = useState(
    initialFromId || members[0]?.id || ""
  );
  const [toMemberId, setToMemberId] = useState(
    initialToId || (members[1]?.id ?? members[0]?.id) || ""
  );
  const [amount, setAmount] = useState(
    initialAmount ? String(initialAmount) : ""
  );
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleOpen = () => {
    if (initialFromId) setFromMemberId(initialFromId);
    if (initialToId) setToMemberId(initialToId);
    if (initialAmount) setAmount(String(initialAmount));
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (fromMemberId === toMemberId) {
      setError("Payer and recipient cannot be the same person");
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    const formData = new FormData();
    formData.append("tripId", tripId);
    formData.append("tripSlug", tripSlug);
    formData.append("fromMemberId", fromMemberId);
    formData.append("toMemberId", toMemberId);
    formData.append("amount", amount);
    if (notes) formData.append("notes", notes);

    startTransition(async () => {
      try {
        await recordSettlement(formData);
        setIsOpen(false);
        setAmount("");
        setNotes("");
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to record settlement");
      }
    });
  };

  return (
    <>
      {triggerButton ? (
        <span onClick={handleOpen} className="inline-block cursor-pointer">
          {triggerButton}
        </span>
      ) : (
        <button
          onClick={handleOpen}
          type="button"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95 text-sm cursor-pointer"
        >
          <Handshake className="w-4 h-4" />
          <span>Record Settlement</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-xs sm:items-center sm:p-4">
          <div className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-zinc-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-150 dark:border-zinc-800 dark:bg-zinc-900 sm:rounded-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-emerald-50/50 dark:bg-emerald-950/30">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Handshake className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                    Record Settlement Payment
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Mark cash / bKash / bank transfer as settled
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                type="button"
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 text-sm rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300">
                  {error}
                </div>
              )}

              {/* From -> To */}
              <div className="flex items-center gap-2">
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Who Paid?
                  </label>
                  <select
                    value={fromMemberId}
                    onChange={(e) => setFromMemberId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-5 text-zinc-400">
                  <ArrowRight className="w-4 h-4" />
                </div>

                <div className="flex-1 space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Paid To?
                  </label>
                  <select
                    value={toMemberId}
                    onChange={(e) => setToMemberId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Amount */}
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Amount Settled ({currency}) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold text-base focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Method / Note (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. bKash / Cash / Hand to hand"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800 sm:flex sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-full rounded-xl px-4 py-3 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 sm:w-auto sm:py-2.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full cursor-pointer rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-700 active:scale-95 disabled:opacity-50 sm:w-auto sm:py-2.5"
                >
                  {isPending ? "Saving..." : "Confirm Settlement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}


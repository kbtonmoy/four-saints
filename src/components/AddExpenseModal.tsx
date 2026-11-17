"use client";

import { useState, useTransition } from "react";
import { Plus, X, DollarSign, Users, Tag, Clock } from "lucide-react";
import { addExpense } from "@/lib/actions";

interface Member {
  id: string;
  name: string;
}

interface Props {
  tripId: string;
  tripSlug: string;
  currency: string;
  members: Member[];
}

const CATEGORIES = [
  { label: "Food & Meals", value: "Food", icon: "🍽️" },
  { label: "Transport", value: "Transport", icon: "🚗" },
  { label: "Hotel / Stay", value: "Hotel", icon: "🏨" },
  { label: "Snacks & Drinks", value: "Snacks", icon: "☕" },
  { label: "Sightseeing / Tickets", value: "Sightseeing", icon: "🎟️" },
  { label: "Fuel / Gas", value: "Fuel", icon: "⛽" },
  { label: "Shopping", value: "Shopping", icon: "🛍️" },
  { label: "Other", value: "Other", icon: "📌" },
];

function getLocalDateTimeString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function AddExpenseModal({ tripId, tripSlug, currency, members }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [paidById, setPaidById] = useState(members[0]?.id || "");
  const [selectedSplits, setSelectedSplits] = useState<string[]>(
    members.map((m) => m.id)
  );
  // Auto date-time of entry
  const [entryDate, setEntryDate] = useState(getLocalDateTimeString());
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loadMemberPreference = () => {
    const saved = localStorage.getItem(`tour-expense-members:${tripId}`);
    if (!saved) return;

    try {
      const preference = JSON.parse(saved) as { paidById?: string; splitMemberIds?: string[] };
      const memberIds = new Set(members.map((member) => member.id));
      if (preference.paidById && memberIds.has(preference.paidById)) {
        setPaidById(preference.paidById);
      }
      const validSplits = preference.splitMemberIds?.filter((id) => memberIds.has(id));
      if (validSplits?.length) setSelectedSplits(validSplits);
    } catch {
      localStorage.removeItem(`tour-expense-members:${tripId}`);
    }
  };

  const rememberMembers = (nextPaidById: string, nextSplits: string[]) => {
    localStorage.setItem(
      `tour-expense-members:${tripId}`,
      JSON.stringify({ paidById: nextPaidById, splitMemberIds: nextSplits })
    );
  };

  const numAmount = parseFloat(amount) || 0;
  const splitCount = selectedSplits.length;
  const perPersonShare =
    splitCount > 0 ? (numAmount / splitCount).toFixed(2) : "0.00";

  const toggleSplit = (id: string) => {
    setSelectedSplits((prev) => {
      const next = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id];
      rememberMembers(paidById, next);
      return next;
    });
  };

  const selectAll = () => {
    const allMemberIds = members.map((m) => m.id);
    setSelectedSplits(allMemberIds);
    rememberMembers(paidById, allMemberIds);
  };
  const deselectAll = () => {
    setSelectedSplits([]);
    rememberMembers(paidById, []);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Please describe the expense");
      return;
    }

    if (numAmount <= 0) {
      setError("Please enter a valid amount greater than 0");
      return;
    }

    if (selectedSplits.length === 0) {
      setError("Please select at least one person sharing this expense");
      return;
    }

    const formData = new FormData();
    formData.append("tripId", tripId);
    formData.append("tripSlug", tripSlug);
    formData.append("title", title.trim());
    formData.append("amount", amount);
    formData.append("category", category);
    formData.append("paidById", paidById);
    formData.append("entryDate", entryDate);
    if (notes) formData.append("notes", notes);
    selectedSplits.forEach((id) => formData.append("splitMembers", id));

    startTransition(async () => {
      try {
        await addExpense(formData);
        // Reset and close
        setTitle("");
        setAmount("");
        setNotes("");
        setEntryDate(getLocalDateTimeString());
        setIsOpen(false);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to record expense");
      }
    });
  };

  return (
    <>
      <button
        onClick={() => {
          loadMemberPreference();
          setEntryDate(getLocalDateTimeString());
          setIsOpen(true);
        }}
        type="button"
        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95 text-sm sm:text-base cursor-pointer"
      >
        <Plus className="w-5 h-5" />
        <span>Add Expense</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center overflow-hidden bg-black/60 p-0 backdrop-blur-xs sm:items-center sm:p-4">
          <div className="flex h-[100dvh] min-w-0 w-full max-w-lg flex-col overflow-hidden bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-150 dark:bg-zinc-900 sm:h-auto sm:max-h-[94dvh] sm:rounded-2xl sm:border sm:border-zinc-200 sm:dark:border-zinc-800">
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-zinc-100 bg-zinc-50/50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/50 sm:px-6 sm:py-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  {currency}
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                    Add Tour Expense
                  </h3>
                  <p className="text-xs text-zinc-500">Add amount, payer and split</p>
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
            <form onSubmit={handleSubmit} className="min-w-0 flex-1 space-y-4 overflow-x-hidden overflow-y-auto p-4 sm:p-6">
              {error && (
                <div className="p-3 text-sm rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300">
                  {error}
                </div>
              )}

              {/* Amount and Title */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Expense Details *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lunch at highway rest stop"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Amount ({currency}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Category & Payer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" /> Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Paid By *
                  </label>
                  <select
                    value={paidById}
                    onChange={(e) => {
                      setPaidById(e.target.value);
                      rememberMembers(e.target.value, selectedSplits);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Auto Date & Time */}
              <div className="space-y-1">
                <label className="flex flex-col items-start gap-1 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" /> Date & Time of Entry (Auto-recorded)
                  </span>
                  <button
                    type="button"
                    onClick={() => setEntryDate(getLocalDateTimeString())}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline text-[11px] font-normal"
                  >
                    Set to Now
                  </button>
                </label>
                <input
                  type="datetime-local"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  className="min-w-0 max-w-full w-full px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Split Members Selection */}
              <div className="space-y-2 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-500" /> Split With ({splitCount} people)
                  </label>
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={selectAll}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      All
                    </button>
                    <span className="text-zinc-300 dark:text-zinc-700">|</span>
                    <button
                      type="button"
                      onClick={deselectAll}
                      className="text-zinc-500 hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {members.map((m) => {
                    const isChecked = selectedSplits.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => toggleSplit(m.id)}
                        className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center justify-center transition-all cursor-pointer ${
                          isChecked
                            ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 dark:border-indigo-600 text-indigo-700 dark:text-indigo-300 font-semibold shadow-xs"
                            : "bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700/60 text-zinc-400"
                        }`}
                      >
                        <span>{m.name}</span>
                        {isChecked && numAmount > 0 && (
                          <span className="text-[10px] mt-0.5 opacity-80">
                            {currency} {perPersonShare}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {numAmount > 0 && splitCount > 0 && (
                  <p className="text-xs text-center text-zinc-500 dark:text-zinc-400">
                    Total <strong className="text-zinc-900 dark:text-zinc-100">{currency} {numAmount}</strong> split between {splitCount} people = <strong className="text-indigo-600 dark:text-indigo-400">{currency} {perPersonShare}</strong> each.
                  </p>
                )}
              </div>

              {/* Optional Notes */}
              <div className="space-y-1">
                <input
                  type="text"
                  placeholder="Optional notes / remarks..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Actions */}
              <div className="sticky bottom-0 -mx-4 grid grid-cols-2 gap-3 border-t border-zinc-100 bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 dark:border-zinc-800 dark:bg-zinc-900 sm:static sm:mx-0 sm:flex sm:items-center sm:justify-end sm:px-0 sm:pb-0 sm:pt-4">
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
                  className="w-full cursor-pointer rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700 active:scale-95 disabled:opacity-50 sm:w-auto sm:py-2.5"
                >
                  {isPending ? "Recording..." : "Save Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}


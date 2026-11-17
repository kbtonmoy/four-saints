"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, ArrowRight } from "lucide-react";
import { createTrip } from "@/lib/actions";

export function CreateTripForm() {
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [currency, setCurrency] = useState("৳");
  // Default to 4 people as requested
  const [members, setMembers] = useState<string[]>([
    "Member 1",
    "Member 2",
    "Member 3",
    "Member 4",
  ]);
  const [error, setError] = useState<string | null>(null);

  const handleMemberChange = (index: number, value: string) => {
    const updated = [...members];
    updated[index] = value;
    setMembers(updated);
  };

  const addMemberField = () => {
    setMembers((prev) => [...prev, `Member ${prev.length + 1}`]);
  };

  const removeMemberField = (index: number) => {
    if (members.length <= 2) {
      alert("At least 2 members are required for splitting expenses");
      return;
    }
    setMembers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const validMembers = members.map((m) => m.trim()).filter((m) => m.length > 0);
    if (!title.trim()) {
      setError("Please give your tour a name");
      return;
    }

    if (validMembers.length < 2) {
      setError("Please specify at least 2 members");
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    if (slug.trim()) formData.append("slug", slug.trim());
    formData.append("currency", currency.trim());
    validMembers.forEach((m) => formData.append("members", m));

    startTransition(async () => {
      try {
        await createTrip(formData);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to create tour");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs sm:text-sm">
          {error}
        </div>
      )}

      {/* Tour Title & Currency */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Tour Name *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Cox's Bazar Roadtrip 2026"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Currency
          </label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="৳">৳ BDT (Taka)</option>
            <option value="$">$ USD (Dollar)</option>
            <option value="₹">₹ INR (Rupee)</option>
            <option value="€">€ EUR (Euro)</option>
            <option value="£">£ GBP (Pound)</option>
            <option value="AED">AED (Dirham)</option>
            <option value="MYR">MYR (Ringgit)</option>
          </select>
        </div>
      </div>

      {/* Custom URL Slug (Optional) */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
          <span>Custom URL Slug (Optional)</span>
          <span className="text-[11px] text-zinc-400 font-normal">Auto-generated if left blank</span>
        </label>
        <div className="flex items-center rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
          <span className="px-3.5 py-2.5 text-xs text-zinc-400 select-none border-r border-zinc-200 dark:border-zinc-700">
            /trip/
          </span>
          <input
            type="text"
            placeholder="e.g. four-friends-tour"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full px-3 py-2.5 bg-transparent text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none"
          />
        </div>
      </div>

      {/* The 4 Group Members */}
      <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Group Members ({members.length} People)
            </label>
            <p className="text-[11px] text-zinc-400">
              Enter everyone&apos;s name so they can log expenses & settle up
            </p>
          </div>
          <button
            type="button"
            onClick={addMemberField}
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Member
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {members.map((name, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <span className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[11px] font-bold text-zinc-500 flex items-center justify-center shrink-0">
                {idx + 1}
              </span>
              <input
                type="text"
                required
                placeholder={`Person ${idx + 1}`}
                value={name}
                onChange={(e) => handleMemberChange(idx, e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {members.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeMemberField(idx)}
                  className="p-1.5 text-zinc-400 hover:text-rose-500 transition cursor-pointer"
                  title="Remove member"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-3">
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-lg shadow-indigo-600/25 transition active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
        >
          {isPending ? (
            <span>Creating Tour...</span>
          ) : (
            <>
              <span>Launch Tour Expense Tracker</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}


"use client";

import { useState } from "react";
import {
  Receipt,
  Users,
  Handshake,
  Trash2,
  Calendar,
  Clock,
  ArrowRight,
  TrendingUp,
  Tag,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { AddExpenseModal } from "./AddExpenseModal";
import { RecordSettlementModal } from "./RecordSettlementModal";
import { ShareTripButton } from "./ShareTripButton";
import { deleteExpense, deleteSettlement } from "@/lib/actions";
import type { MemberBalance, SuggestedSettlement } from "@/lib/settlement";

interface Member {
  id: string;
  name: string;
}

interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  category: string;
  paidById: string;
  paidBy: { name: string };
  date: Date | string;
  createdAt: Date | string;
  notes?: string | null;
  splits: {
    id: string;
    memberId: string;
    amount: number;
    member: { name: string };
  }[];
}

interface SettlementItem {
  id: string;
  amount: number;
  notes?: string | null;
  createdAt: Date | string;
  fromMember: { id: string; name: string };
  toMember: { id: string; name: string };
}

interface Props {
  readOnly?: boolean;
  trip: {
    id: string;
    slug: string;
    title: string;
    currency: string;
    createdAt: Date | string;
  };
  members: Member[];
  expenses: ExpenseItem[];
  settlements: SettlementItem[];
  memberBalances: MemberBalance[];
  suggestedSettlements: SuggestedSettlement[];
  totalTripSpending: number;
}

const CATEGORY_ICONS: Record<string, string> = {
  Food: "🍽️",
  Transport: "🚗",
  Hotel: "🏨",
  Snacks: "☕",
  Sightseeing: "🎟️",
  Fuel: "⛽",
  Shopping: "🛍️",
  Other: "📌",
};

export function TripView({
  readOnly = false,
  trip,
  members,
  expenses,
  settlements,
  memberBalances,
  suggestedSettlements,
  totalTripSpending,
}: Props) {
  const [activeTab, setActiveTab] = useState<"expenses" | "settlements" | "stats">("expenses");
  const averagePerPerson =
    members.length > 0 ? (totalTripSpending / members.length).toFixed(2) : "0.00";

  // Category breakdown calculation
  const categoryTotals: Record<string, number> = {};
  for (const exp of expenses) {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
  }
  const categoryList = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const maxBalance = Math.max(...memberBalances.map((m) => Math.abs(m.netBalance)), 1);

  const formatDate = (dateInput: Date | string) => {
    const d = new Date(dateInput);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateInput: Date | string) => {
    const d = new Date(dateInput);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Header Card */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-2xl p-4 sm:rounded-3xl sm:p-8 shadow-xl relative overflow-hidden">
        {/* Background glow decoration */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 sm:pb-6 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs uppercase tracking-widest font-semibold text-indigo-300">
                  Tour Expense Tracker
                </span>
                <span className="text-white/30">•</span>
                <span className="text-xs text-indigo-200">
                  {members.length} Members
                </span>
              </div>
              <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
                {trip.title}
              </h1>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <ShareTripButton title={trip.title} />
              {!readOnly && (
                <AddExpenseModal tripId={trip.id} tripSlug={trip.slug} currency={trip.currency} members={members} />
              )}
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 pt-4 sm:pt-6">
            <div className="bg-white/5 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/10">
              <span className="text-xs font-medium text-indigo-200">
                Total Tour Spent
              </span>
              <p className="text-lg sm:text-2xl font-bold mt-1 text-white break-words">
                {trip.currency} {totalTripSpending.toLocaleString()}
              </p>
              <span className="text-[11px] text-white/50">
                Across {expenses.length} expenses
              </span>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/10">
              <span className="text-xs font-medium text-indigo-200">
                Average / Person
              </span>
              <p className="text-lg sm:text-2xl font-bold mt-1 text-white break-words">
                {trip.currency} {Number(averagePerPerson).toLocaleString()}
              </p>
              <span className="text-[11px] text-white/50">
                Split across {members.length} friends
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-white/5 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/10 flex flex-col justify-between">
              <span className="text-xs font-medium text-indigo-200">
                Settlement Status
              </span>
              <div className="flex items-center gap-2 mt-1">
                {suggestedSettlements.length === 0 ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm font-semibold text-emerald-300">
                      All Settled Up!
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-amber-400" />
                    <span className="text-sm font-semibold text-amber-300">
                      {suggestedSettlements.length} payment{suggestedSettlements.length > 1 ? "s" : ""} pending
                    </span>
                  </>
                )}
              </div>
              <span className="text-[11px] text-white/50">
                {settlements.length} recorded payments
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Member Balances Summary Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-500" /> Members Net Balance
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          {memberBalances.map((m) => {
            const isCreditor = m.netBalance > 0.01;
            const isDebtor = m.netBalance < -0.01;
            return (
              <div
                key={m.memberId}
                className={`min-w-0 p-3 sm:p-3.5 rounded-xl border transition-all ${
                  isCreditor
                    ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60"
                    : isDebtor
                    ? "bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/60"
                    : "bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700/60"
                }`}
              >
                <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <span className="max-w-full truncate font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                    {m.name}
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      isCreditor
                        ? "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300"
                        : isDebtor
                        ? "bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300"
                        : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    {isCreditor && `+${trip.currency} ${m.netBalance.toFixed(2)}`}
                    {isDebtor && `-${trip.currency} ${Math.abs(m.netBalance).toFixed(2)}`}
                    {!isCreditor && !isDebtor && "Settled"}
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                  <div
                    className={`h-full rounded-full ${isCreditor ? "bg-emerald-500" : isDebtor ? "bg-rose-500" : "bg-zinc-400"}`}
                    style={{ width: `${Math.max((Math.abs(m.netBalance) / maxBalance) * 100, isCreditor || isDebtor ? 6 : 0)}%` }}
                  />
                </div>
                <div className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
                  <span>Paid {trip.currency}{m.totalPaid.toFixed(0)}</span>
                  <span>Share {trip.currency}{m.totalShare.toFixed(0)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs Control */}
      <div className="flex flex-col gap-2 border-b border-zinc-200 dark:border-zinc-800 sm:flex-row sm:items-end sm:justify-between">
        <div className="grid w-full grid-cols-3 sm:flex sm:w-auto sm:gap-2">
          <button
            onClick={() => setActiveTab("expenses")}
            className={`flex min-w-0 items-center justify-center gap-1.5 px-1 pb-3 text-xs font-semibold transition-all border-b-2 cursor-pointer sm:px-3 sm:text-sm ${
              activeTab === "expenses"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Expenses ({expenses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("settlements")}
            className={`flex min-w-0 items-center justify-center gap-1.5 px-1 pb-3 text-xs font-semibold transition-all border-b-2 cursor-pointer sm:px-3 sm:text-sm ${
              activeTab === "settlements"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <Handshake className="w-4 h-4" />
            <span><span className="sm:hidden">Settle</span><span className="hidden sm:inline">Settlement Plan</span></span>
            {suggestedSettlements.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
                {suggestedSettlements.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("stats")}
            className={`flex min-w-0 items-center justify-center gap-1.5 px-1 pb-3 text-xs font-semibold transition-all border-b-2 cursor-pointer sm:px-3 sm:text-sm ${
              activeTab === "stats"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Breakdown</span>
          </button>
        </div>

        {!readOnly && activeTab === "settlements" && (
          <div className="self-end pb-2">
            <RecordSettlementModal
              tripId={trip.id}
              tripSlug={trip.slug}
              currency={trip.currency}
              members={members}
            />
          </div>
        )}
      </div>

      {/* Tab 1: Expenses List */}
      {activeTab === "expenses" && (
        <div className="space-y-3">
          {expenses.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-3xl p-8">
              <div className="w-16 h-16 mx-auto rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                <Receipt className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 text-lg">
                No tour expenses recorded yet
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-sm mx-auto mt-1 mb-5">
                Hit &quot;Add Expense&quot; above whenever someone spends on food, transport, stay, or fuel!
              </p>
              {!readOnly && (
                <AddExpenseModal tripId={trip.id} tripSlug={trip.slug} currency={trip.currency} members={members} />
              )}
            </div>
          ) : (
            expenses.map((exp) => (
              <div
                key={exp.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-indigo-200 dark:hover:border-indigo-900 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xl shrink-0">
                    {CATEGORY_ICONS[exp.category] || "📌"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
                        {exp.title}
                      </h3>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                        {exp.category}
                      </span>
                    </div>

                    {/* Auto Date & Time Badge */}
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                        {formatDate(exp.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        {formatTime(exp.date)}
                      </span>
                      <span className="text-zinc-300 dark:text-zinc-700">•</span>
                      <span>
                        Paid by{" "}
                        <strong className="text-zinc-800 dark:text-zinc-200 font-semibold">
                          {exp.paidBy.name}
                        </strong>
                      </span>
                    </div>

                    {/* Split Details */}
                    <div className="mt-2 text-xs text-zinc-500 flex items-center gap-1.5 flex-wrap">
                      <Users className="w-3.5 h-3.5 text-blue-500" />
                      <span>
                        Split {exp.splits.length} ways (
                        {exp.splits.map((s) => s.member.name).join(", ")}
                        )
                      </span>
                      {exp.notes && (
                        <span className="italic text-zinc-400">
                          — &quot;{exp.notes}&quot;
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Amount and Delete Action */}
                <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800">
                  <div className="text-left sm:text-right">
                    <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                      {trip.currency} {exp.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      {trip.currency}{" "}
                      {(exp.amount / exp.splits.length).toFixed(2)} / person
                    </p>
                  </div>

                  {!readOnly && <form action={deleteExpense}>
                    <input type="hidden" name="expenseId" value={exp.id} />
                    <input type="hidden" name="tripSlug" value={trip.slug} />
                    <button
                      type="submit"
                      onClick={(e) => {
                        if (!confirm("Are you sure you want to delete this expense?")) {
                          e.preventDefault();
                        }
                      }}
                      title="Delete expense"
                      className="p-2 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </form>}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Settlement Plan */}
      {activeTab === "settlements" && (
        <div className="space-y-6">
          {/* Active Required Settlements */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
                  Optimal Settlement Plan
                </h3>
                <p className="text-xs text-zinc-500">
                  Calculates minimum transfers needed to balance the group.
                </p>
              </div>
            </div>

            {suggestedSettlements.length === 0 ? (
              <div className="text-center py-10 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl p-6">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                <h4 className="font-bold text-emerald-800 dark:text-emerald-200 text-base">
                  Everyone is completely settled up!
                </h4>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                  No one owes anyone money at this time.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {suggestedSettlements.map((s, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold flex items-center justify-center text-sm shrink-0">
                        {s.fromName[0]}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">
                          {s.fromName}
                        </span>
                        <span className="text-xs text-zinc-500 flex items-center gap-1 font-medium">
                          pays <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                        </span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {s.toName}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-200 dark:border-zinc-700">
                      <span className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
                        {trip.currency} {s.amount.toFixed(2)}
                      </span>

                      {!readOnly && <RecordSettlementModal
                        tripId={trip.id}
                        tripSlug={trip.slug}
                        currency={trip.currency}
                        members={members}
                        initialFromId={s.fromMemberId}
                        initialToId={s.toMemberId}
                        initialAmount={s.amount}
                        triggerButton={
                          <button
                            type="button"
                            className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
                          >
                            Mark Settled
                          </button>
                        }
                      />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recorded Payments History */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs">
            <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 mb-1">
              Settlement History
            </h3>
            <p className="text-xs text-zinc-500 mb-4">
              Recorded payments made between members (cash, bKash, etc.)
            </p>

            {settlements.length === 0 ? (
              <p className="text-xs text-zinc-400 italic py-4">
                No settlement payments recorded yet.
              </p>
            ) : (
              <div className="space-y-2.5">
                {settlements.map((set) => (
                  <div
                    key={set.id}
                    className="p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 flex items-start justify-between gap-2 sm:p-3.5 sm:items-center"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                          {set.fromMember.name} paid {set.toMember.name} {trip.currency} {set.amount.toFixed(2)}
                        </p>
                        <p className="text-[11px] text-zinc-400">
                          {formatDate(set.createdAt)} at {formatTime(set.createdAt)}
                          {set.notes && ` • "${set.notes}"`}
                        </p>
                      </div>
                    </div>

                    {!readOnly && <form action={deleteSettlement}>
                      <input type="hidden" name="settlementId" value={set.id} />
                      <input type="hidden" name="tripSlug" value={trip.slug} />
                      <button
                        type="submit"
                        onClick={(e) => {
                          if (!confirm("Delete this settlement record?")) {
                            e.preventDefault();
                          }
                        }}
                        className="text-zinc-400 hover:text-rose-500 p-1 rounded-md transition"
                        title="Delete settlement"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Breakdown & Statistics */}
      {activeTab === "stats" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Spending by Category */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs">
            <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 mb-1 flex items-center gap-2">
              <Tag className="w-4 h-4 text-indigo-500" /> Spending by Category
            </h3>
            <p className="text-xs text-zinc-500 mb-5">
              Where the tour budget is going
            </p>

            {categoryList.length === 0 ? (
              <p className="text-xs text-zinc-400 italic">No expenses yet.</p>
            ) : (
              <div className="space-y-4">
                {categoryList.map(([cat, total]) => {
                  const percentage =
                    totalTripSpending > 0
                      ? Math.round((total / totalTripSpending) * 100)
                      : 0;
                  return (
                    <div key={cat} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="flex items-center gap-1.5">
                          <span>{CATEGORY_ICONS[cat] || "📌"}</span>
                          <span>{cat}</span>
                        </span>
                        <span>
                          {trip.currency} {total.toLocaleString()} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Member Spending Table */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs">
            <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 mb-1 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-500" /> Member Details
            </h3>
            <p className="text-xs text-zinc-500 mb-5">
              Total paid vs consumed share
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400">
                    <th className="pb-2 font-semibold">Person</th>
                    <th className="pb-2 font-semibold text-right">Paid</th>
                    <th className="pb-2 font-semibold text-right">Share</th>
                    <th className="pb-2 font-semibold text-right">Net</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {memberBalances.map((m) => (
                    <tr key={m.memberId}>
                      <td className="py-2.5 font-bold text-zinc-800 dark:text-zinc-200">
                        {m.name}
                      </td>
                      <td className="py-2.5 text-right font-medium">
                        {trip.currency} {m.totalPaid.toFixed(2)}
                      </td>
                      <td className="py-2.5 text-right font-medium">
                        {trip.currency} {m.totalShare.toFixed(2)}
                      </td>
                      <td
                        className={`py-2.5 text-right font-bold ${
                          m.netBalance > 0.01
                            ? "text-emerald-600 dark:text-emerald-400"
                            : m.netBalance < -0.01
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-zinc-400"
                        }`}
                      >
                        {m.netBalance > 0.01 ? `+${m.netBalance.toFixed(2)}` : m.netBalance.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


import Link from "next/link";
import { Settings } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { calculateTripBalances } from "@/lib/settlement";
import { TripView } from "@/components/TripView";

export default async function HomePage() {
  const trip = await prisma.trip.findFirst({
    orderBy: { createdAt: "desc" },
    include: {
      members: { orderBy: { createdAt: "asc" } },
      expenses: {
        orderBy: { date: "desc" },
        include: { paidBy: true, splits: { include: { member: true } } },
      },
      settlements: {
        orderBy: { createdAt: "desc" },
        include: { fromMember: true, toMember: true },
      },
    },
  });

  if (!trip) {
    return (
      <main className="min-h-screen grid place-items-center bg-zinc-50 dark:bg-zinc-950 p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">No tour created yet</h1>
          <Link href="/admin" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white">
            <Settings className="size-4" /> Open Admin
          </Link>
        </div>
      </main>
    );
  }

  const balances = calculateTripBalances({
    members: trip.members,
    expenses: trip.expenses,
    settlements: trip.settlements,
  });

  return (
    <main className="min-h-screen bg-zinc-50/70 px-3 py-4 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="flex justify-end">
          <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-indigo-600">
            <Settings className="size-3.5" /> Admin
          </Link>
        </div>
        <TripView readOnly trip={trip} members={trip.members} expenses={trip.expenses} settlements={trip.settlements} {...balances} />
      </div>
    </main>
  );
}

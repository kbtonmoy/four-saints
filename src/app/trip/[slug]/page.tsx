import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { calculateTripBalances } from "@/lib/settlement";
import { TripView } from "@/components/TripView";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function TripPage({ params }: Props) {
  const { slug } = await params;

  const trip = await prisma.trip.findUnique({
    where: { slug },
    include: {
      members: {
        orderBy: { createdAt: "asc" },
      },
      expenses: {
        orderBy: { date: "desc" },
        include: {
          paidBy: true,
          splits: {
            include: {
              member: true,
            },
          },
        },
      },
      settlements: {
        orderBy: { createdAt: "desc" },
        include: {
          fromMember: true,
          toMember: true,
        },
      },
    },
  });

  if (!trip) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-md w-full text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-xl">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
            <Compass className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Tour Not Found
          </h2>
          <p className="text-sm text-zinc-500 mt-2 mb-6">
            We couldn&apos;t find any tour with the link &quot;{slug}&quot;. Check the URL or create a new tour.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go to Home</span>
          </Link>
        </div>
      </main>
    );
  }

  // Calculate balances & settlement suggestions
  const { memberBalances, suggestedSettlements, totalTripSpending } =
    calculateTripBalances({
      members: trip.members,
      expenses: trip.expenses,
      settlements: trip.settlements,
    });

  return (
    <main className="min-h-screen bg-zinc-50/70 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation bar */}
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Tours</span>
          </Link>
          <div className="text-xs text-zinc-400">
            Public Tour • ID: <code className="bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-mono">{trip.slug}</code>
          </div>
        </header>

        {/* Main View */}
        <TripView
          trip={{
            id: trip.id,
            slug: trip.slug,
            title: trip.title,
            currency: trip.currency,
            createdAt: trip.createdAt,
          }}
          members={trip.members}
          expenses={trip.expenses}
          settlements={trip.settlements}
          memberBalances={memberBalances}
          suggestedSettlements={suggestedSettlements}
          totalTripSpending={totalTripSpending}
        />
      </div>
    </main>
  );
}


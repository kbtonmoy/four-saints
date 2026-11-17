import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { calculateTripBalances } from "@/lib/settlement";
import { TripView } from "@/components/TripView";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function TripPage({ params }: Props) {
  const { slug } = await params;
  const isAdmin = (await cookies()).get("tour_admin")?.value === "tonmoy";

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
    notFound();
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
          readOnly={!isAdmin}
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


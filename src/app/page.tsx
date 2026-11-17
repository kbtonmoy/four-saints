import Link from "next/link";
import { Compass, Users, Clock, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { CreateTripForm } from "@/components/CreateTripForm";

export default async function HomePage() {
  let recentTrips: {
    id: string;
    slug: string;
    title: string;
    currency: string;
    createdAt: Date;
    _count: { members: number; expenses: number };
  }[] = [];

  try {
    recentTrips = await prisma.trip.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        currency: true,
        createdAt: true,
        _count: {
          select: { members: true, expenses: true },
        },
      },
    });
  } catch {
    // Database may not be initialized yet
  }

  return (
    <main className="min-h-screen bg-zinc-50/70 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <nav className="border-b border-zinc-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-md shadow-indigo-600/30">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-zinc-900 dark:text-white">
                TourSplit
              </span>
              <span className="block text-[10px] text-zinc-400 font-medium">
                Trip Expense & Settlement
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/60 px-3 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Own PostgreSQL DB</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">
        {/* Hero Section */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>4 Friends Tour Expense & Smart Settlement</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-white">
            Split tour costs without the headache.
          </h1>
          <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
            Log expenditures with auto date-time, split equally or individually, and calculate who owes whom in one click. Share a public link with your friends on mobile.
          </p>
        </div>

        {/* Create Tour Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              Create Tour Tracker
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Set up your tour and pre-populate your 4 group members
            </p>
          </div>

          <CreateTripForm />
        </div>

        {/* Existing / Recent Tours */}
        {recentTrips.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
                Recent Tours in Database
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {recentTrips.map((t) => (
                <Link
                  key={t.id}
                  href={`/trip/${t.slug}`}
                  className="group p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <h4 className="font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition text-sm">
                      {t.title}
                    </h4>
                    <p className="text-xs text-zinc-400 mt-1 font-mono">
                      /trip/{t.slug}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {t._count.members} Members
                    </span>
                    <span className="font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5">
                      Open <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Features highlight */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-zinc-200 dark:border-zinc-800 text-center">
          <div className="p-4 rounded-2xl bg-white/50 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60">
            <Clock className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mx-auto mb-2" />
            <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              Auto Date & Time
            </h4>
            <p className="text-xs text-zinc-500 mt-1">
              Every expense automatically captures the exact timestamp of entry.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/50 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60">
            <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
            <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              Smart Settlement
            </h4>
            <p className="text-xs text-zinc-500 mt-1">
              Greedy debt simplification reduces transfers to the bare minimum.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/50 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60">
            <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
            <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              Public Link & Postgres
            </h4>
            <p className="text-xs text-zinc-500 mt-1">
              No logins required on the road. Works on any self-hosted Postgres.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

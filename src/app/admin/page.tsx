import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowLeft, ArrowRight, LockKeyhole, LogOut, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { CreateTripForm } from "@/components/CreateTripForm";
import { adminLogin, adminLogout } from "./actions";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const isAdmin = (await cookies()).get("tour_admin")?.value === "tonmoy";

  if (!isAdmin) {
    const { error } = await searchParams;
    return (
      <main className="min-h-screen grid place-items-center bg-zinc-50 p-4 dark:bg-zinc-950">
        <form action={adminLogin} className="w-full max-w-sm space-y-5 rounded-3xl border border-zinc-200 bg-white p-7 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
          <div className="space-y-1 text-center">
            <LockKeyhole className="mx-auto size-9 text-indigo-500" />
            <h1 className="text-xl font-bold">Admin Access</h1>
            <p className="text-xs text-zinc-500">Enter the temporary project password.</p>
          </div>
          {error && <p className="rounded-lg bg-rose-50 p-2 text-center text-xs text-rose-600">Incorrect password</p>}
          <input name="password" type="password" required autoFocus placeholder="Password" className="w-full rounded-xl border border-zinc-300 bg-transparent px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700" />
          <button className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700">Continue</button>
          <Link href="/" className="block text-center text-xs text-zinc-500 hover:text-indigo-600">Back to expenses</Link>
        </form>
      </main>
    );
  }

  const trips = await prisma.trip.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, slug: true, title: true, _count: { select: { members: true, expenses: true } } },
  });

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 dark:bg-zinc-950">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-1 text-sm font-semibold text-zinc-500 hover:text-indigo-600"><ArrowLeft className="size-4" /> Expenses</Link>
          <form action={adminLogout}><button className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-rose-500"><LogOut className="size-3.5" /> Log out</button></form>
        </header>

        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
          <h1 className="mb-1 text-xl font-bold">Create Tour Tracker</h1>
          <p className="mb-6 text-xs text-zinc-500">Create a tour and add its group members.</p>
          <CreateTripForm />
        </section>

        {trips.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Tours</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {trips.map((trip) => (
                <Link key={trip.id} href={`/trip/${trip.slug}`} className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-4 hover:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-900">
                  <div><p className="font-bold">{trip.title}</p><p className="mt-1 flex items-center gap-1 text-xs text-zinc-500"><Users className="size-3" /> {trip._count.members} members · {trip._count.expenses} expenses</p></div>
                  <ArrowRight className="size-4 text-indigo-500" />
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

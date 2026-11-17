"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { splitAmountEvenly } from "./settlement";

const CATEGORIES = new Set([
  "Food", "Transport", "Hotel", "Snacks", "Sightseeing", "Fuel", "Shopping", "Other",
]);

async function requireAdmin() {
  if ((await cookies()).get("tour_admin")?.value !== "tonmoy") {
    throw new Error("Admin access required");
  }
}

function parseAmount(value: FormDataEntryValue | null): number {
  const raw = typeof value === "string" ? value.trim() : "";
  const amount = Number(raw);
  if (!/^\d+(?:\.\d{1,2})?$/.test(raw) || !Number.isFinite(amount) || amount <= 0) {
    throw new Error("Amount must be a positive number with at most 2 decimal places");
  }
  return amount;
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-"); // Replace multiple - with single -
}

export async function createTrip(formData: FormData) {
  await requireAdmin();
  const title = (formData.get("title") as string)?.trim();
  let slug = (formData.get("slug") as string)?.trim();
  const currency = ((formData.get("currency") as string) || "৳").trim();

  // Extract member names (expecting 4 or custom)
  const memberNamesRaw = formData.getAll("members") as string[];
  const validMemberNames = memberNamesRaw
    .map((m) => m.trim())
    .filter((m) => m.length > 0);

  if (!title) {
    throw new Error("Trip title is required");
  }

  if (validMemberNames.length < 2) {
    throw new Error("At least 2 members are required");
  }

  if (new Set(validMemberNames).size !== validMemberNames.length) {
    throw new Error("Member names must be unique");
  }

  if (!currency || currency.length > 8) {
    throw new Error("Currency is invalid");
  }

  if (!slug) {
    slug = slugify(title);
  } else {
    slug = slugify(slug);
  }
  if (!slug) slug = "trip";

  // Ensure unique slug
  let finalSlug = slug;
  let counter = 1;
  while (await prisma.trip.findUnique({ where: { slug: finalSlug } })) {
    finalSlug = `${slug}-${counter}`;
    counter++;
  }

  await prisma.trip.create({
    data: {
      title,
      slug: finalSlug,
      currency,
      members: {
        create: validMemberNames.map((name) => ({ name })),
      },
    },
  });

  revalidatePath("/");
  redirect(`/trip/${finalSlug}`);
}

export async function addExpense(formData: FormData) {
  const tripId = formData.get("tripId") as string;
  const tripSlug = formData.get("tripSlug") as string;
  const title = (formData.get("title") as string)?.trim();
  const amountValue = formData.get("amount");
  const category = (formData.get("category") as string) || "General";
  const paidById = formData.get("paidById") as string;
  const entryDateRaw = formData.get("entryDate") as string;
  const notes = (formData.get("notes") as string)?.trim() || null;

  // Selected split member IDs
  const splitMemberIds = formData.getAll("splitMembers") as string[];

  if (!tripId || !title || amountValue === null || !paidById) {
    throw new Error("Missing required expense fields");
  }

  const amount = parseAmount(amountValue);

  if (splitMemberIds.length === 0) {
    throw new Error("Expense must be split with at least 1 person");
  }

  if (new Set(splitMemberIds).size !== splitMemberIds.length) {
    throw new Error("Split members must be unique");
  }
  if (!CATEGORIES.has(category)) throw new Error("Invalid expense category");

  const memberIds = [...new Set([paidById, ...splitMemberIds])];
  const validMemberCount = await prisma.member.count({
    where: { tripId, id: { in: memberIds } },
  });
  if (validMemberCount !== memberIds.length) {
    throw new Error("Every expense member must belong to this trip");
  }

  const shares = splitAmountEvenly(amount, splitMemberIds.length);

  // Use entered date or current timestamp automatically
  const expenseDate = entryDateRaw ? new Date(entryDateRaw) : new Date();
  if (Number.isNaN(expenseDate.getTime())) throw new Error("Invalid expense date");

  await prisma.expense.create({
    data: {
      tripId,
      title,
      amount,
      category,
      paidById,
      date: expenseDate,
      createdAt: new Date(), // Auto timestamp of creation
      notes,
      splits: {
        create: splitMemberIds.map((memberId, index) => ({
          memberId,
          amount: shares[index],
        })),
      },
    },
  });

  revalidatePath(`/trip/${tripSlug}`);
  revalidatePath("/");
}

export async function deleteExpense(formData: FormData) {
  await requireAdmin();
  const expenseId = formData.get("expenseId") as string;

  if (!expenseId) return;

  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
    select: { trip: { select: { slug: true } } },
  });
  if (!expense) return;

  await prisma.expense.delete({
    where: { id: expenseId },
  });

  revalidatePath(`/trip/${expense.trip.slug}`);
  revalidatePath("/");
}

export async function recordSettlement(formData: FormData) {
  const tripId = formData.get("tripId") as string;
  const tripSlug = formData.get("tripSlug") as string;
  const fromMemberId = formData.get("fromMemberId") as string;
  const toMemberId = formData.get("toMemberId") as string;
  const amountValue = formData.get("amount");
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!tripId || !fromMemberId || !toMemberId || amountValue === null) {
    throw new Error("Invalid settlement submission");
  }

  const amount = parseAmount(amountValue);
  if (fromMemberId === toMemberId) throw new Error("A member cannot pay themselves");

  const validMemberCount = await prisma.member.count({
    where: { tripId, id: { in: [fromMemberId, toMemberId] } },
  });
  if (validMemberCount !== 2) {
    throw new Error("Settlement members must belong to this trip");
  }

  await prisma.settlementRecord.create({
    data: {
      tripId,
      fromMemberId,
      toMemberId,
      amount,
      notes,
    },
  });

  revalidatePath(`/trip/${tripSlug}`);
  revalidatePath("/");
}

export async function deleteSettlement(formData: FormData) {
  await requireAdmin();
  const settlementId = formData.get("settlementId") as string;

  if (!settlementId) return;

  const settlement = await prisma.settlementRecord.findUnique({
    where: { id: settlementId },
    select: { trip: { select: { slug: true } } },
  });
  if (!settlement) return;

  await prisma.settlementRecord.delete({
    where: { id: settlementId },
  });

  revalidatePath(`/trip/${settlement.trip.slug}`);
  revalidatePath("/");
}


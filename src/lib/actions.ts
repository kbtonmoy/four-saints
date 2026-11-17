"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";

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

  if (!slug) {
    slug = slugify(title);
  } else {
    slug = slugify(slug);
  }

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

  redirect(`/trip/${finalSlug}`);
}

export async function addExpense(formData: FormData) {
  const tripId = formData.get("tripId") as string;
  const tripSlug = formData.get("tripSlug") as string;
  const title = (formData.get("title") as string)?.trim();
  const amountStr = formData.get("amount") as string;
  const category = (formData.get("category") as string) || "General";
  const paidById = formData.get("paidById") as string;
  const entryDateRaw = formData.get("entryDate") as string;
  const notes = (formData.get("notes") as string)?.trim() || null;

  // Selected split member IDs
  const splitMemberIds = formData.getAll("splitMembers") as string[];

  if (!tripId || !title || !amountStr || !paidById) {
    throw new Error("Missing required expense fields");
  }

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    throw new Error("Invalid amount");
  }

  if (splitMemberIds.length === 0) {
    throw new Error("Expense must be split with at least 1 person");
  }

  // Equal split calculation
  const sharePerPerson = Math.round((amount / splitMemberIds.length) * 100) / 100;

  // Use entered date or current timestamp automatically
  const expenseDate = entryDateRaw ? new Date(entryDateRaw) : new Date();

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
        create: splitMemberIds.map((memberId) => ({
          memberId,
          amount: sharePerPerson,
        })),
      },
    },
  });

  revalidatePath(`/trip/${tripSlug}`);
}

export async function deleteExpense(formData: FormData) {
  const expenseId = formData.get("expenseId") as string;
  const tripSlug = formData.get("tripSlug") as string;

  if (!expenseId) return;

  await prisma.expense.delete({
    where: { id: expenseId },
  });

  revalidatePath(`/trip/${tripSlug}`);
}

export async function recordSettlement(formData: FormData) {
  const tripId = formData.get("tripId") as string;
  const tripSlug = formData.get("tripSlug") as string;
  const fromMemberId = formData.get("fromMemberId") as string;
  const toMemberId = formData.get("toMemberId") as string;
  const amountStr = formData.get("amount") as string;
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!tripId || !fromMemberId || !toMemberId || !amountStr) {
    throw new Error("Invalid settlement submission");
  }

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    throw new Error("Invalid settlement amount");
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
}

export async function deleteSettlement(formData: FormData) {
  const settlementId = formData.get("settlementId") as string;
  const tripSlug = formData.get("tripSlug") as string;

  if (!settlementId) return;

  await prisma.settlementRecord.delete({
    where: { id: settlementId },
  });

  revalidatePath(`/trip/${tripSlug}`);
}


"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function adminLogin(formData: FormData) {
  if (formData.get("password") !== "tonmoy") redirect("/admin?error=1");

  (await cookies()).set("tour_admin", "tonmoy", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  redirect("/admin");
}

export async function adminLogout() {
  (await cookies()).delete("tour_admin");
  redirect("/admin");
}

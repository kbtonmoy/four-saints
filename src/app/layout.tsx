import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TourSplit - Tour Expense & Smart Settlement Tracker",
  description:
    "Track group tour expenditures, automatic date-time recording, and calculate who owes whom with your own PostgreSQL database.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100">
        {children}
      </body>
    </html>
  );
}

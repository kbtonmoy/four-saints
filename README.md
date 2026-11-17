# 🎒 TourSplit - 4 Friends Tour Expense & Settlement Tracker

A production-ready **Next.js 15+ (App Router)** tour expense tracking and smart debt settlement web application, designed specifically for group trips (pre-configured for 4 people, but flexible for any group size).

Built with **Prisma ORM**, **Tailwind CSS**, and full compatibility with your **own PostgreSQL database** (self-hosted, VPS, Neon, Render, or AWS RDS). Ready for instant one-click deployment to **Vercel** with public link sharing.

---

## ✨ Features

- **⚡ Instant Public Link Access**: Share `/trip/[slug]` with all 4 friends. No logins, accounts, or friction required while traveling.
- **🕒 Auto Date & Time Stamp**: Every expenditure automatically captures the exact timestamp of entry, with an option to set custom dates when backlogging.
- **⚖️ Smart Settlement Engine**: Uses a greedy debt-minimization algorithm to calculate the absolute minimum number of transfers between members (e.g. turning 10 mutual debts into just 2-3 direct payments).
- **👥 Flexible Splits**: Automatically splits equally among all 4 members by default, or allows unchecking members for individual/custom splits.
- **🏷️ Categories & Tagging**: Food 🍽️, Transport 🚗, Stay 🏨, Snacks ☕, Tickets 🎟️, Fuel ⛽, Shopping 🛍️, and Other 📌.
- **🤝 Settle Up History**: One-click "Mark Settled" button records real cash/bKash/bank transfers and updates everyone's balance in real time.
- **📊 Real-time Balances & Breakdown**: Instant visual feedback on who is in the positive (creditor) vs negative (debtor), plus spending category analytics.
- **🐘 Your Own PostgreSQL**: Completely independent of Supabase. Connects to any standard PostgreSQL database.

---

## 🚀 Quick Start

### 1. Configure Your Database URL
Open `.env` in the root folder and provide your PostgreSQL connection string:

```env
DATABASE_URL="postgresql://username:password@your-postgres-host:5432/tour_db?schema=public&sslmode=prefer"
```

### 2. Push Schema to Database
Create all required tables (`Trip`, `Member`, `Expense`, `ExpenseSplit`, `SettlementRecord`):

```bash
npx prisma db push
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deploying to Vercel

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Tour tracker with settlement and PostgreSQL"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```

2. **Import into Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new) and import your repository.
   - In **Settings > Environment Variables**, add:
     - `DATABASE_URL`: `postgresql://<user>:<password>@<your-db-host>:5432/<db_name>?sslmode=prefer`

3. **Deploy**:
   - Vercel will automatically run `prisma generate && next build --webpack`.
   - Once deployed, copy your production URL (e.g. `https://tour-tracker.vercel.app`) and share it with your tour group!

---

## 📁 Project Structure

```
tour-tracker/
├── prisma/
│   └── schema.prisma         # Postgres schema (Trip, Member, Expense, Split, Settlement)
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Responsive root layout & metadata
│   │   ├── page.tsx          # Home page (Create Tour with 4 members, recent tours)
│   │   └── trip/[slug]/
│   │       └── page.tsx      # Public trip page with dynamic data loading
│   ├── components/
│   │   ├── AddExpenseModal.tsx       # Expense logging with auto timestamp & split picker
│   │   ├── RecordSettlementModal.tsx # Record settlements between members
│   │   ├── ShareTripButton.tsx       # One-click copy/share public link
│   │   └── TripView.tsx              # Timeline, settlement cards & breakdown tabs
│   └── lib/
│       ├── actions.ts        # Next.js Server Actions (CRUD operations)
│       ├── prisma.ts         # Singleton Prisma client instance
│       └── settlement.ts     # Pure debt-minimization settlement algorithm
└── package.json
```

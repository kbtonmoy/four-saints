export interface MemberBalance {
  memberId: string;
  name: string;
  totalPaid: number;      // Amount spent on group expenses
  totalShare: number;     // Amount consumed across expenses
  settlementPaid: number; // Cash transferred in recorded settlements
  settlementReceived: number; // Cash received in recorded settlements
  netBalance: number;     // Net status: + means get back, - means owes
}

export interface SuggestedSettlement {
  fromMemberId: string;
  fromName: string;
  toMemberId: string;
  toName: string;
  amount: number;
}

export interface CalculateSettlementInput {
  members: { id: string; name: string }[];
  expenses: {
    id: string;
    paidById: string;
    amount: number;
    splits: { memberId: string; amount: number }[];
  }[];
  settlements: {
    id: string;
    fromMemberId: string;
    toMemberId: string;
    amount: number;
  }[];
}

export function splitAmountEvenly(amount: number, count: number): number[] {
  if (!Number.isFinite(amount) || amount <= 0 || !Number.isInteger(count) || count <= 0) {
    throw new Error("Invalid split");
  }

  const totalCents = Math.round(amount * 100);
  const baseCents = Math.floor(totalCents / count);
  const remainder = totalCents % count;

  return Array.from(
    { length: count },
    (_, index) => (baseCents + (index < remainder ? 1 : 0)) / 100
  );
}

export function calculateTripBalances(input: CalculateSettlementInput) {
  const { members, expenses, settlements } = input;

  const balanceMap: Record<string, MemberBalance> = {};

  for (const m of members) {
    balanceMap[m.id] = {
      memberId: m.id,
      name: m.name,
      totalPaid: 0,
      totalShare: 0,
      settlementPaid: 0,
      settlementReceived: 0,
      netBalance: 0,
    };
  }

  // 1. Process group expenses
  for (const exp of expenses) {
    if (balanceMap[exp.paidById]) {
      balanceMap[exp.paidById].totalPaid += Math.round(exp.amount * 100);
    }

    for (const split of exp.splits) {
      if (balanceMap[split.memberId]) {
        balanceMap[split.memberId].totalShare += Math.round(split.amount * 100);
      }
    }
  }

  // 2. Process recorded settlement payments
  for (const set of settlements) {
    if (balanceMap[set.fromMemberId]) {
      balanceMap[set.fromMemberId].settlementPaid += Math.round(set.amount * 100);
    }
    if (balanceMap[set.toMemberId]) {
      balanceMap[set.toMemberId].settlementReceived += Math.round(set.amount * 100);
    }
  }

  // 3. Compute net balance for each member
  for (const m of members) {
    const b = balanceMap[m.id];
    // Net balance = (what I paid out) - (what I consumed)
    b.netBalance =
      (b.totalPaid + b.settlementPaid - b.totalShare - b.settlementReceived) / 100;
    b.totalPaid /= 100;
    b.totalShare /= 100;
    b.settlementPaid /= 100;
    b.settlementReceived /= 100;
  }

  // 4. Calculate minimal debt settlements
  // Split into debtors (net < 0) and creditors (net > 0)
  const debtors: { memberId: string; name: string; amount: number }[] = [];
  const creditors: { memberId: string; name: string; amount: number }[] = [];

  for (const m of members) {
    const net = balanceMap[m.id].netBalance;
    if (net < -0.01) {
      debtors.push({ memberId: m.id, name: m.name, amount: -net });
    } else if (net > 0.01) {
      creditors.push({ memberId: m.id, name: m.name, amount: net });
    }
  }

  // Sort descending by amount to optimize matches
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const suggestedSettlements: SuggestedSettlement[] = [];
  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const settleAmount = Math.min(debtor.amount, creditor.amount);
    const rounded = Math.round(settleAmount * 100) / 100;

    if (rounded > 0.01) {
      suggestedSettlements.push({
        fromMemberId: debtor.memberId,
        fromName: debtor.name,
        toMemberId: creditor.memberId,
        toName: creditor.name,
        amount: rounded,
      });
    }

    debtor.amount -= settleAmount;
    creditor.amount -= settleAmount;

    if (debtor.amount < 0.01) dIdx++;
    if (creditor.amount < 0.01) cIdx++;
  }

  const totalTripSpending = expenses.reduce((sum, e) => sum + e.amount, 0);

  return {
    memberBalances: Object.values(balanceMap),
    suggestedSettlements,
    totalTripSpending: Math.round(totalTripSpending * 100) / 100,
  };
}


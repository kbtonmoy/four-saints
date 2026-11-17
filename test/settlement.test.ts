import assert from "node:assert/strict";
import test from "node:test";
import { calculateTripBalances, splitAmountEvenly } from "../src/lib/settlement.ts";

test("equal splits preserve the exact expense total", () => {
  for (const [amount, count] of [[10, 3], [100, 6], [0.05, 2]] as const) {
    const shares = splitAmountEvenly(amount, count);
    assert.equal(Math.round(shares.reduce((sum, share) => sum + share, 0) * 100), amount * 100);
  }
});

test("balances remain zero-sum after a rounded split", () => {
  const shares = splitAmountEvenly(10, 3);
  const result = calculateTripBalances({
    members: [
      { id: "a", name: "A" },
      { id: "b", name: "B" },
      { id: "c", name: "C" },
    ],
    expenses: [{
      id: "expense",
      paidById: "a",
      amount: 10,
      splits: ["a", "b", "c"].map((memberId, index) => ({ memberId, amount: shares[index] })),
    }],
    settlements: [],
  });

  assert.equal(result.memberBalances.reduce((sum, member) => sum + member.netBalance, 0), 0);
  assert.equal(result.suggestedSettlements.reduce((sum, item) => sum + item.amount, 0), 6.66);
});

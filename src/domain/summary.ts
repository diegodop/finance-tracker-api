import type { Transaction } from "./transaction.js";

export interface CategoryTotals {
  income: number;
  expense: number;
  balance: number;
}

export interface Summary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  byCategory: Record<string, CategoryTotals>;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateSummary(transactions: Transaction[]): Summary {
  const byCategory: Record<string, CategoryTotals> = {};
  let totalIncome = 0;
  let totalExpense = 0;

  for (const transaction of transactions) {
    const bucket = byCategory[transaction.category] ?? {
      income: 0,
      expense: 0,
      balance: 0,
    };

    if (transaction.type === "income") {
      totalIncome += transaction.amount;
      bucket.income += transaction.amount;
    } else {
      totalExpense += transaction.amount;
      bucket.expense += transaction.amount;
    }

    bucket.balance = round2(bucket.income - bucket.expense);
    byCategory[transaction.category] = bucket;
  }

  for (const key of Object.keys(byCategory)) {
    byCategory[key].income = round2(byCategory[key].income);
    byCategory[key].expense = round2(byCategory[key].expense);
  }

  return {
    totalIncome: round2(totalIncome),
    totalExpense: round2(totalExpense),
    balance: round2(totalIncome - totalExpense),
    byCategory,
  };
}

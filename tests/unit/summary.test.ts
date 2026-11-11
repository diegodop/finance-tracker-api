import { describe, expect, it } from "vitest";
import { calculateSummary } from "../../src/domain/summary.js";
import type { Transaction } from "../../src/domain/transaction.js";

function tx(partial: Partial<Transaction>): Transaction {
  return {
    id: partial.id ?? "id",
    description: partial.description ?? "desc",
    amount: partial.amount ?? 0,
    type: partial.type ?? "income",
    category: partial.category ?? "geral",
    date: partial.date ?? new Date("2026-01-01"),
  };
}

describe("calculateSummary", () => {
  it("retorna zeros para lista vazia", () => {
    const summary = calculateSummary([]);

    expect(summary).toEqual({
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      byCategory: {},
    });
  });

  it("soma corretamente quando so ha receitas", () => {
    const summary = calculateSummary([
      tx({ type: "income", amount: 100, category: "salario" }),
      tx({ type: "income", amount: 50, category: "freela" }),
    ]);

    expect(summary.totalIncome).toBe(150);
    expect(summary.totalExpense).toBe(0);
    expect(summary.balance).toBe(150);
  });

  it("soma corretamente quando so ha despesas", () => {
    const summary = calculateSummary([
      tx({ type: "expense", amount: 30, category: "mercado" }),
      tx({ type: "expense", amount: 20, category: "transporte" }),
    ]);

    expect(summary.totalIncome).toBe(0);
    expect(summary.totalExpense).toBe(50);
    expect(summary.balance).toBe(-50);
  });

  it("calcula saldo correto com receitas e despesas misturadas", () => {
    const summary = calculateSummary([
      tx({ type: "income", amount: 1000, category: "salario" }),
      tx({ type: "expense", amount: 300, category: "mercado" }),
      tx({ type: "expense", amount: 100, category: "transporte" }),
    ]);

    expect(summary.totalIncome).toBe(1000);
    expect(summary.totalExpense).toBe(400);
    expect(summary.balance).toBe(600);
  });

  it("agrupa totais por categoria corretamente", () => {
    const summary = calculateSummary([
      tx({ type: "income", amount: 200, category: "salario" }),
      tx({ type: "expense", amount: 50, category: "salario" }),
      tx({ type: "expense", amount: 80, category: "mercado" }),
    ]);

    expect(summary.byCategory.salario).toEqual({ income: 200, expense: 50, balance: 150 });
    expect(summary.byCategory.mercado).toEqual({ income: 0, expense: 80, balance: -80 });
  });

  it("arredonda valores com casas decimais para 2 digitos", () => {
    const summary = calculateSummary([
      tx({ type: "income", amount: 10.1, category: "a" }),
      tx({ type: "income", amount: 10.2, category: "a" }),
    ]);

    expect(summary.totalIncome).toBe(20.3);
  });
});

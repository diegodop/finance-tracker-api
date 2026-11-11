import type { Express } from "express";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../src/app.js";
import { prisma } from "../../src/lib/prisma-client.js";

let app: Express;

beforeAll(() => {
  app = createApp(prisma);
});

beforeEach(async () => {
  await prisma.transaction.deleteMany();
});

afterAll(async () => {
  await prisma.transaction.deleteMany();
  await prisma.$disconnect();
});

describe("fluxo de transacoes (create -> list -> summary)", () => {
  it("cria, lista e reflete a transacao no summary", async () => {
    const createResponse = await request(app)
      .post("/transactions")
      .send({
        description: "Salario de novembro",
        amount: 5000,
        type: "income",
        category: "salario",
        date: "2026-11-05",
      });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.id).toBeDefined();

    await request(app).post("/transactions").send({
      description: "Mercado",
      amount: 450.5,
      type: "expense",
      category: "mercado",
      date: "2026-11-06",
    });

    const listResponse = await request(app).get("/transactions");
    expect(listResponse.status).toBe(200);
    expect(listResponse.body).toHaveLength(2);

    const summaryResponse = await request(app).get("/transactions/summary");
    expect(summaryResponse.status).toBe(200);
    expect(summaryResponse.body.totalIncome).toBe(5000);
    expect(summaryResponse.body.totalExpense).toBe(450.5);
    expect(summaryResponse.body.balance).toBe(4549.5);
  });

  it("rejeita payload invalido com 400", async () => {
    const response = await request(app).post("/transactions").send({
      description: "",
      amount: -10,
      type: "invalid",
      category: "x",
      date: "not-a-date",
    });

    expect(response.status).toBe(400);
  });

  it("filtra transacoes por tipo", async () => {
    await request(app).post("/transactions").send({
      description: "Salario",
      amount: 100,
      type: "income",
      category: "salario",
      date: "2026-11-01",
    });
    await request(app).post("/transactions").send({
      description: "Conta de luz",
      amount: 20,
      type: "expense",
      category: "casa",
      date: "2026-11-02",
    });

    const response = await request(app).get("/transactions?type=expense");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].type).toBe("expense");
  });

  it("responde 200 em /health", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });
});

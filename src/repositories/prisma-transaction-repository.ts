import type { PrismaClient } from "@prisma/client";
import type { NewTransaction, Transaction, TransactionFilters } from "../domain/transaction.js";
import type { TransactionRepository } from "./transaction-repository.js";

export class PrismaTransactionRepository implements TransactionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: NewTransaction): Promise<Transaction> {
    const created = await this.prisma.transaction.create({
      data: {
        description: data.description,
        amount: data.amount,
        type: data.type,
        category: data.category,
        date: data.date,
      },
    });

    return this.toDomain(created);
  }

  async findMany(filters: TransactionFilters): Promise<Transaction[]> {
    const rows = await this.prisma.transaction.findMany({
      where: {
        type: filters.type,
        category: filters.category,
        date: {
          gte: filters.from,
          lte: filters.to,
        },
      },
      orderBy: { date: "desc" },
    });

    return rows.map((row) => this.toDomain(row));
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.transaction.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  private toDomain(row: {
    id: string;
    description: string;
    amount: { toNumber(): number };
    type: string;
    category: string;
    date: Date;
  }): Transaction {
    return {
      id: row.id,
      description: row.description,
      amount: row.amount.toNumber(),
      type: row.type as Transaction["type"],
      category: row.category,
      date: row.date,
    };
  }
}

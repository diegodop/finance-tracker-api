import type { NewTransaction, Transaction, TransactionFilters } from "../domain/transaction.js";

export interface TransactionRepository {
  create(data: NewTransaction): Promise<Transaction>;
  findMany(filters: TransactionFilters): Promise<Transaction[]>;
  delete(id: string): Promise<boolean>;
}

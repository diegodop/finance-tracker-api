export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: Date;
}

export interface NewTransaction {
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: Date;
}

export interface TransactionFilters {
  type?: TransactionType;
  category?: string;
  from?: Date;
  to?: Date;
}

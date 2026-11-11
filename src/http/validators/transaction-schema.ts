import { z } from "zod";

export const createTransactionSchema = z.object({
  description: z.string().min(1).max(255),
  amount: z.number().positive(),
  type: z.enum(["income", "expense"]),
  category: z.string().min(1).max(100),
  date: z.coerce.date(),
});

export const listTransactionsQuerySchema = z.object({
  type: z.enum(["income", "expense"]).optional(),
  category: z.string().min(1).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type ListTransactionsQuery = z.infer<typeof listTransactionsQuerySchema>;

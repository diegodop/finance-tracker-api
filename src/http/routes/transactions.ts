import { Router } from "express";
import { calculateSummary } from "../../domain/summary.js";
import type { TransactionRepository } from "../../repositories/transaction-repository.js";
import { HttpError } from "../middlewares/error-handler.js";
import { createTransactionSchema, listTransactionsQuerySchema } from "../validators/transaction-schema.js";

export function createTransactionsRouter(repository: TransactionRepository): Router {
  const router = Router();

  router.post("/", async (req, res, next) => {
    try {
      const input = createTransactionSchema.parse(req.body);
      const transaction = await repository.create(input);
      res.status(201).json(transaction);
    } catch (err) {
      next(err);
    }
  });

  router.get("/", async (req, res, next) => {
    try {
      const filters = listTransactionsQuerySchema.parse(req.query);
      const transactions = await repository.findMany(filters);
      res.json(transactions);
    } catch (err) {
      next(err);
    }
  });

  router.get("/summary", async (req, res, next) => {
    try {
      const filters = listTransactionsQuerySchema.parse(req.query);
      const transactions = await repository.findMany(filters);
      res.json(calculateSummary(transactions));
    } catch (err) {
      next(err);
    }
  });

  router.delete("/:id", async (req, res, next) => {
    try {
      const deleted = await repository.delete(req.params.id);
      if (!deleted) {
        throw new HttpError(404, "transaction_not_found");
      }
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  });

  return router;
}

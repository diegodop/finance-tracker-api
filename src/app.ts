import express, { type Express } from "express";
import pinoHttp from "pino-http";
import type { PrismaClient } from "@prisma/client";
import { createTransactionsRouter } from "./http/routes/transactions.js";
import { errorHandler } from "./http/middlewares/error-handler.js";
import { logger } from "./observability/logger.js";
import { metricsMiddleware, registry } from "./observability/metrics.js";
import { PrismaTransactionRepository } from "./repositories/prisma-transaction-repository.js";

export function createApp(prisma: PrismaClient): Express {
  const app = express();
  const repository = new PrismaTransactionRepository(prisma);

  app.use(express.json());
  app.use(pinoHttp({ logger }));
  app.use(metricsMiddleware);

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/metrics", async (_req, res) => {
    res.set("Content-Type", registry.contentType);
    res.end(await registry.metrics());
  });

  app.use("/transactions", createTransactionsRouter(repository));

  app.use(errorHandler);

  return app;
}

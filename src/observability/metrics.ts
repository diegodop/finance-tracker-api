import type { NextFunction, Request, Response } from "express";
import client from "prom-client";

export const registry = new client.Registry();
client.collectDefaultMetrics({ register: registry });

/**
 * SLO declarado (M3): p95 < 200ms em GET /transactions/summary,
 * com ~1.000 transacoes no banco (ambiente local). Ver docs/desempenho.md.
 */
export const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duracao das requisicoes HTTP em segundos",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.01, 0.025, 0.05, 0.1, 0.2, 0.5, 1, 2, 5],
  registers: [registry],
});

export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const durationNs = process.hrtime.bigint() - start;
    const durationSeconds = Number(durationNs) / 1e9;
    const route = req.route?.path ? req.baseUrl + req.route.path : req.path;

    httpRequestDuration.observe(
      {
        method: req.method,
        route,
        status_code: String(res.statusCode),
      },
      durationSeconds,
    );
  });

  next();
}

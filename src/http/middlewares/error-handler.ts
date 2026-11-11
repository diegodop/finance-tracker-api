import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "../../observability/logger.js";

export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
  }
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    res.status(400).json({ error: "validation_error", details: err.flatten() });
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  logger.error({ err, path: req.path }, "unhandled_error");
  res.status(500).json({ error: "internal_server_error" });
}

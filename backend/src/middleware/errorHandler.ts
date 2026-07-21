import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: "validation_error",
      message: "Invalid request data",
      details: err.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.name, message: err.message });
    return;
  }

  // Errors thrown by Express/body-parser itself (e.g. PayloadTooLargeError,
  // malformed-JSON SyntaxError) carry an HTTP statusCode but aren't ZodError/AppError.
  const status = (err as { statusCode?: number; status?: number } | null)?.statusCode
    ?? (err as { statusCode?: number; status?: number } | null)?.status;
  if (typeof status === "number" && status >= 400 && status < 500) {
    res.status(status).json({ error: "bad_request", message: (err as Error).message });
    return;
  }

  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ error: "internal_error", message: "Something went wrong" });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ error: "not_found", message: `Route ${req.method} ${req.path} not found` });
}

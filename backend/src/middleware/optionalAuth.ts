import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "./requireAuth";
import { verifyAuthToken } from "../utils/jwt";

export function optionalAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    try {
      const payload = verifyAuthToken(header.slice("Bearer ".length));
      req.user = { id: payload.sub, email: payload.email };
    } catch {
      // Invalid/expired token on a public route: proceed unauthenticated.
    }
  }
  next();
}

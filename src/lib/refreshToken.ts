import crypto from "node:crypto";
import ms from "../lib/ms";
import { env } from "../config/env";

export function generateRefreshTokenValue(): string {
  return crypto.randomBytes(48).toString("hex");
}

export function refreshTokenExpiryDate(): Date {
  return new Date(Date.now() + ms(env.jwtRefreshExpiresIn));
}

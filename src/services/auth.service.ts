import { prisma } from "../lib/prisma";
import { hashPassword, verifyPassword } from "../lib/password";
import { signAccessToken } from "../lib/jwt";
import { generateRefreshTokenValue, refreshTokenExpiryDate } from "../lib/refreshToken";
import { ConflictError, UnauthorizedError } from "../lib/errors";
import type { LoginInput, RegisterInput } from "../validators/auth.validators";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface PublicUser {
  id: string;
  email: string;
  createdAt: Date;
}

function toPublicUser(user: { id: string; email: string; createdAt: Date }): PublicUser {
  return { id: user.id, email: user.email, createdAt: user.createdAt };
}

async function issueTokens(user: { id: string; email: string }): Promise<AuthTokens> {
  const accessToken = signAccessToken({ sub: user.id, email: user.email });

  const refreshToken = generateRefreshTokenValue();
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: refreshTokenExpiryDate(),
    },
  });

  return { accessToken, refreshToken };
}

export async function registerUser(
  input: RegisterInput,
): Promise<{ user: PublicUser; tokens: AuthTokens }> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new ConflictError("Ya existe una cuenta con ese email");
  }

  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: { email: input.email, passwordHash },
  });

  const tokens = await issueTokens(user);
  return { user: toPublicUser(user), tokens };
}

export async function loginUser(
  input: LoginInput,
): Promise<{ user: PublicUser; tokens: AuthTokens }> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new UnauthorizedError("Credenciales inválidas");
  }

  const valid = await verifyPassword(input.password, user.passwordHash);
  if (!valid) {
    throw new UnauthorizedError("Credenciales inválidas");
  }

  const tokens = await issueTokens(user);
  return { user: toPublicUser(user), tokens };
}

export async function refreshSession(refreshTokenValue: string): Promise<AuthTokens> {
  const stored = await prisma.refreshToken.findUnique({
    where: { token: refreshTokenValue },
    include: { user: true },
  });

  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    throw new UnauthorizedError("Refresh token inválido o expirado");
  }

  // Rotate: revoke the used token and issue a new pair.
  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() },
  });

  return issueTokens(stored.user);
}

export async function revokeRefreshToken(refreshTokenValue: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { token: refreshTokenValue, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function getUserById(userId: string): Promise<PublicUser | null> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user ? toPublicUser(user) : null;
}

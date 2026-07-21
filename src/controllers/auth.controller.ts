import type { NextFunction, Request, Response } from "express";
import {
  loginSchema,
  refreshSchema,
  registerSchema,
} from "../validators/auth.validators";
import {
  getUserById,
  loginUser,
  refreshSession,
  registerUser,
  revokeRefreshToken,
} from "../services/auth.service";
import { UnauthorizedError } from "../lib/errors";

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const input = registerSchema.parse(req.body);
    const { user, tokens } = await registerUser(input);
    res.status(201).json({ user, ...tokens });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const input = loginSchema.parse(req.body);
    const { user, tokens } = await loginUser(input);
    res.status(200).json({ user, ...tokens });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const input = refreshSchema.parse(req.body);
    const tokens = await refreshSession(input.refreshToken);
    res.status(200).json(tokens);
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const input = refreshSchema.parse(req.body);
    await revokeRefreshToken(input.refreshToken);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.userId) {
      throw new UnauthorizedError();
    }
    const user = await getUserById(req.userId);
    if (!user) {
      throw new UnauthorizedError();
    }
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
}

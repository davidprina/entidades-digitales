import { apiFetch } from "./client";
import type { AuthUser } from "../types";

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export function register(email: string, password: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/register", { method: "POST", body: { email, password }, auth: false });
}

export function login(email: string, password: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/login", { method: "POST", body: { email, password }, auth: false });
}

export function fetchMe(): Promise<{ user: AuthUser }> {
  return apiFetch<{ user: AuthUser }>("/auth/me");
}

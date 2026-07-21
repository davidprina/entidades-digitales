import { apiFetch } from "./client";
import type { EntityType, PublicEntity, ResolveResult } from "../types";

export function resolveSlug(slug: string): Promise<ResolveResult> {
  return apiFetch<ResolveResult>(`/entities/resolve/${encodeURIComponent(slug)}`, { auth: true });
}

export function claimEntity(input: { slug: string; entityType: EntityType; title: string }) {
  return apiFetch<{ entity: PublicEntity }>("/entities/claim", { method: "POST", body: input });
}

export function listMyEntities(): Promise<{ entities: PublicEntity[] }> {
  return apiFetch<{ entities: PublicEntity[] }>("/entities/mine");
}

export function getMyEntity(id: string): Promise<{ entity: PublicEntity }> {
  return apiFetch<{ entity: PublicEntity }>(`/entities/${id}`);
}

export function createEntity(input: {
  slug?: string;
  entityType: EntityType;
  title: string;
  payload: Record<string, unknown>;
}) {
  return apiFetch<{ entity: PublicEntity }>("/entities", { method: "POST", body: input });
}

export function updateEntity(
  id: string,
  input: Partial<{ title: string; isActive: boolean; payload: Record<string, unknown> }>,
) {
  return apiFetch<{ entity: PublicEntity }>(`/entities/${id}`, { method: "PATCH", body: input });
}

export function deleteEntity(id: string): Promise<void> {
  return apiFetch<void>(`/entities/${id}`, { method: "DELETE" });
}

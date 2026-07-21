import { z } from "zod";
import { EntityType } from "../generated/prisma/enums";

const entityTypeValues = Object.values(EntityType) as [string, ...string[]];

export const slugParamSchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "El código debe tener al menos 3 caracteres")
    .max(32, "El código no puede superar 32 caracteres")
    .regex(/^[a-z0-9-]+$/, "El código solo puede contener letras, números y guiones"),
});

export const claimEntitySchema = z.object({
  slug: slugParamSchema.shape.slug,
  entityType: z.enum(entityTypeValues),
  title: z.string().trim().min(1, "El título es requerido").max(200),
});

export type ClaimEntityInput = z.infer<typeof claimEntitySchema>;

export const createEntitySchema = z.object({
  slug: slugParamSchema.shape.slug.optional(),
  entityType: z.enum(entityTypeValues),
  title: z.string().trim().min(1, "El título es requerido").max(200),
  payload: z.unknown().optional(),
});

export type CreateEntityInput = z.infer<typeof createEntitySchema>;

export const updateEntitySchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    entityType: z.enum(entityTypeValues).optional(),
    isActive: z.boolean().optional(),
    payload: z.unknown().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, "No hay campos para actualizar");

export type UpdateEntityInput = z.infer<typeof updateEntitySchema>;

export const idParamSchema = z.object({
  id: z.string().uuid("ID inválido"),
});

import type { Response } from "express";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/AppError";
import {
  claimEntitySchema,
  createEntitySchema,
  idParamSchema,
  slugParamSchema,
  updateEntitySchema,
} from "../routes/entity.schemas";
import type { AuthenticatedRequest } from "../middleware/requireAuth";
import type { EntityType } from "../generated/prisma/enums";
import { generateSlug } from "../utils/slug";
import { validatePayload } from "../schemas/payloads";

const SLUG_GENERATION_ATTEMPTS = 5;

function toPublicEntity(
  entity: {
    id: string;
    slug: string;
    entityType: string;
    title: string;
    isActive: boolean;
    isClaimed: boolean;
    payload: unknown;
    userId: string | null;
    createdAt: Date;
    updatedAt: Date;
  },
  viewerId?: string,
) {
  return {
    id: entity.id,
    slug: entity.slug,
    entityType: entity.entityType,
    title: entity.title,
    isActive: entity.isActive,
    isClaimed: entity.isClaimed,
    payload: entity.payload,
    isOwner: viewerId != null && viewerId === entity.userId,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}

export async function resolveEntity(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { slug } = slugParamSchema.parse({ slug: req.params["slug"] });

  const entity = await prisma.entity.findUnique({ where: { slug } });

  if (!entity) {
    res.status(404).json({ exists: false, isClaimed: false, slug });
    return;
  }

  if (!entity.isClaimed) {
    res.status(200).json({
      exists: true,
      isClaimed: false,
      slug: entity.slug,
      entityType: entity.entityType,
      title: entity.title,
    });
    return;
  }

  res.status(200).json({
    exists: true,
    isClaimed: true,
    entity: toPublicEntity(entity, req.user?.id),
  });
}

export async function claimEntity(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    throw new AppError(401, "Not authenticated");
  }

  const { slug, entityType, title } = claimEntitySchema.parse(req.body);
  const type = entityType as EntityType;

  const entity = await prisma.$transaction(async (tx) => {
    const existing = await tx.entity.findUnique({ where: { slug } });

    if (existing) {
      if (existing.isClaimed) {
        throw new AppError(409, "Este código ya fue reclamado");
      }
      return tx.entity.update({
        where: { slug },
        data: {
          userId: req.user!.id,
          isClaimed: true,
          entityType: type,
          title,
        },
      });
    }

    return tx.entity.create({
      data: {
        slug,
        entityType: type,
        title,
        userId: req.user!.id,
        isClaimed: true,
      },
    });
  });

  res.status(200).json({ entity: toPublicEntity(entity, req.user.id) });
}

export async function listMyEntities(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    throw new AppError(401, "Not authenticated");
  }

  const entities = await prisma.entity.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
  });

  res.status(200).json({ entities: entities.map((e) => toPublicEntity(e, req.user!.id)) });
}

export async function createEntity(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    throw new AppError(401, "Not authenticated");
  }

  const { slug, entityType, title, payload } = createEntitySchema.parse(req.body);
  const type = entityType as EntityType;
  const validatedPayload = validatePayload(type, payload);

  if (slug) {
    const existing = await prisma.entity.findUnique({ where: { slug } });
    if (existing) {
      throw new AppError(409, "Este código ya está en uso");
    }
    const entity = await prisma.entity.create({
      data: { slug, entityType: type, title, payload: validatedPayload, userId: req.user.id, isClaimed: true },
    });
    res.status(201).json({ entity: toPublicEntity(entity, req.user.id) });
    return;
  }

  for (let attempt = 0; attempt < SLUG_GENERATION_ATTEMPTS; attempt++) {
    try {
      const entity = await prisma.entity.create({
        data: {
          slug: generateSlug(),
          entityType: type,
          title,
          payload: validatedPayload,
          userId: req.user.id,
          isClaimed: true,
        },
      });
      res.status(201).json({ entity: toPublicEntity(entity, req.user.id) });
      return;
    } catch (err) {
      const isUniqueClash =
        err instanceof Object && "code" in err && (err as { code: string }).code === "P2002";
      if (!isUniqueClash || attempt === SLUG_GENERATION_ATTEMPTS - 1) {
        throw err;
      }
    }
  }
}

async function loadOwnedEntity(id: string, userId: string) {
  const entity = await prisma.entity.findUnique({ where: { id } });
  if (!entity) {
    throw new AppError(404, "Entidad no encontrada");
  }
  if (entity.userId !== userId) {
    throw new AppError(403, "No tenés permiso para modificar esta entidad");
  }
  return entity;
}

export async function updateEntity(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    throw new AppError(401, "Not authenticated");
  }

  const { id } = idParamSchema.parse(req.params);
  const updates = updateEntitySchema.parse(req.body);

  const existing = await loadOwnedEntity(id, req.user.id);

  const nextType = (updates.entityType as EntityType | undefined) ?? (existing.entityType as EntityType);
  const nextPayload =
    updates.payload !== undefined ? validatePayload(nextType, updates.payload) : undefined;

  const entity = await prisma.entity.update({
    where: { id },
    data: {
      ...(updates.title !== undefined && { title: updates.title }),
      ...(updates.entityType !== undefined && { entityType: nextType }),
      ...(updates.isActive !== undefined && { isActive: updates.isActive }),
      ...(nextPayload !== undefined && { payload: nextPayload }),
    },
  });

  res.status(200).json({ entity: toPublicEntity(entity, req.user.id) });
}

export async function deleteEntity(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    throw new AppError(401, "Not authenticated");
  }

  const { id } = idParamSchema.parse(req.params);
  await loadOwnedEntity(id, req.user.id);

  await prisma.entity.delete({ where: { id } });
  res.status(204).send();
}

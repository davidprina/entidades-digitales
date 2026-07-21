import { z } from "zod";
import { EntityType } from "../generated/prisma/enums";
import type { Prisma } from "../generated/prisma/client";

const sportsTeamPayloadSchema = z
  .object({
    crestUrl: z.string().trim().optional(),
    players: z
      .array(
        z.object({
          number: z.number().int().optional(),
          name: z.string().trim().min(1),
          position: z.string().trim().optional(),
          photoUrl: z.string().trim().optional(),
        }),
      )
      .optional(),
    staff: z.array(z.object({ name: z.string().trim().min(1), role: z.string().trim().optional() })).optional(),
    nextMatch: z
      .object({
        opponent: z.string().trim().optional(),
        date: z.string().trim().optional(),
        venue: z.string().trim().optional(),
      })
      .optional(),
    standingsPosition: z.number().int().optional(),
    socialLinks: z.record(z.string(), z.string()).optional(),
  })
  .passthrough();

const tournamentPayloadSchema = z
  .object({
    standings: z
      .array(
        z.object({
          team: z.string().trim().min(1),
          played: z.number().int().optional(),
          won: z.number().int().optional(),
          drawn: z.number().int().optional(),
          lost: z.number().int().optional(),
          points: z.number().int().optional(),
        }),
      )
      .optional(),
    fixture: z
      .array(
        z.object({
          date: z.string().trim().optional(),
          time: z.string().trim().optional(),
          homeTeam: z.string().trim().min(1),
          awayTeam: z.string().trim().min(1),
          venue: z.string().trim().optional(),
        }),
      )
      .optional(),
    topScorers: z
      .array(
        z.object({
          player: z.string().trim().min(1),
          team: z.string().trim().optional(),
          goals: z.number().int().nonnegative(),
        }),
      )
      .optional(),
  })
  .passthrough();

const sportsPlayerPayloadSchema = z
  .object({
    photoUrl: z.string().trim().optional(),
    number: z.number().int().optional(),
    position: z.string().trim().optional(),
    stats: z.record(z.string(), z.union([z.number(), z.string()])).optional(),
    medicalNotes: z.string().trim().optional(),
    insurance: z
      .object({ provider: z.string().trim().optional(), policyNumber: z.string().trim().optional() })
      .optional(),
    emergencyContact: z
      .object({
        name: z.string().trim().min(1),
        phone: z.string().trim().min(1),
        relationship: z.string().trim().optional(),
      })
      .optional(),
  })
  .passthrough();

const menuPayloadSchema = z
  .object({
    categories: z.array(
      z.object({
        name: z.string().trim().min(1),
        items: z.array(
          z.object({
            name: z.string().trim().min(1),
            price: z.number().nonnegative(),
            description: z.string().trim().optional(),
          }),
        ),
      }),
    ),
  })
  .passthrough();

const catalogPayloadSchema = z
  .object({
    products: z.array(
      z.object({
        name: z.string().trim().min(1),
        price: z.number().nonnegative(),
        imageUrl: z.string().trim().optional(),
        description: z.string().trim().optional(),
      }),
    ),
  })
  .passthrough();

const vcardPayloadSchema = z
  .object({
    fullName: z.string().trim().min(1),
    jobTitle: z.string().trim().optional(),
    company: z.string().trim().optional(),
    phone: z.string().trim().optional(),
    email: z.string().trim().toLowerCase().email().optional(),
    website: z.string().trim().optional(),
    socialLinks: z.record(z.string(), z.string()).optional(),
  })
  .passthrough();

const emergencyIdPayloadSchema = z
  .object({
    fullName: z.string().trim().optional(),
    bloodType: z.string().trim().optional(),
    medicalNotes: z.string().trim().optional(),
    emergencyContacts: z
      .array(
        z.object({
          name: z.string().trim().min(1),
          phone: z.string().trim().min(1),
          relationship: z.string().trim().optional(),
        }),
      )
      .min(1, "Se requiere al menos un contacto de emergencia"),
    whatsappNumber: z.string().trim().optional(),
    rewardOffered: z.boolean().optional(),
  })
  .passthrough();

export const payloadSchemaByEntityType: Record<EntityType, z.ZodType> = {
  sports_team: sportsTeamPayloadSchema,
  tournament: tournamentPayloadSchema,
  sports_player: sportsPlayerPayloadSchema,
  menu: menuPayloadSchema,
  catalog: catalogPayloadSchema,
  vcard: vcardPayloadSchema,
  emergency_id: emergencyIdPayloadSchema,
};

export function validatePayload(entityType: EntityType, payload: unknown): Prisma.InputJsonValue {
  return payloadSchemaByEntityType[entityType].parse(payload ?? {}) as Prisma.InputJsonValue;
}

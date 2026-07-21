import { prisma } from "../lib/prisma";
import { hashPassword } from "../utils/password";

describe("Entity model", () => {
  it("creates an unclaimed entity with a JSONB payload", async () => {
    const entity = await prisma.entity.create({
      data: {
        slug: "AB123",
        entityType: "menu",
        title: "Menu Café Central",
        payload: {
          categories: [{ name: "Bebidas", items: [{ name: "Café", price: 2.5 }] }],
        },
      },
    });

    expect(entity.isClaimed).toBe(false);
    expect(entity.userId).toBeNull();
    expect(entity.payload).toMatchObject({
      categories: [{ name: "Bebidas", items: [{ name: "Café", price: 2.5 }] }],
    });
  });

  it("enforces unique slugs", async () => {
    await prisma.entity.create({
      data: { slug: "DUPE1", entityType: "vcard", title: "Test", payload: {} },
    });

    await expect(
      prisma.entity.create({
        data: { slug: "DUPE1", entityType: "vcard", title: "Test 2", payload: {} },
      }),
    ).rejects.toThrow();
  });

  it("claims an entity by linking it to a user", async () => {
    const user = await prisma.user.create({
      data: { email: "owner@example.com", passwordHash: await hashPassword("supersecret123") },
    });

    const entity = await prisma.entity.create({
      data: { slug: "CLAIMME", entityType: "emergency_id", title: "ID Card", payload: {} },
    });

    const claimed = await prisma.entity.update({
      where: { id: entity.id },
      data: { userId: user.id, isClaimed: true },
    });

    expect(claimed.isClaimed).toBe(true);
    expect(claimed.userId).toBe(user.id);
  });

  it("sets user_id to null when the owning user is deleted", async () => {
    const user = await prisma.user.create({
      data: { email: "temp@example.com", passwordHash: await hashPassword("supersecret123") },
    });

    const entity = await prisma.entity.create({
      data: {
        slug: "ORPHAN1",
        entityType: "catalog",
        title: "Catalog",
        payload: {},
        userId: user.id,
        isClaimed: true,
      },
    });

    await prisma.user.delete({ where: { id: user.id } });

    const reloaded = await prisma.entity.findUniqueOrThrow({ where: { id: entity.id } });
    expect(reloaded.userId).toBeNull();
  });
});

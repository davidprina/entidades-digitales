import request from "supertest";
import { createApp } from "../app";
import { prisma } from "../lib/prisma";

const app = createApp();

async function registerAndGetToken(email: string): Promise<{ token: string; userId: string }> {
  const res = await request(app).post("/api/auth/register").send({
    email,
    password: "supersecret123",
  });
  return { token: res.body.token as string, userId: res.body.user.id as string };
}

describe("GET /api/entities/resolve/:slug", () => {
  it("returns exists:false for an unknown slug", async () => {
    const res = await request(app).get("/api/entities/resolve/ab123");
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ exists: false, isClaimed: false });
  });

  it("returns isClaimed:false for a pre-provisioned but unclaimed slug", async () => {
    await prisma.entity.create({
      data: { slug: "preprov1", entityType: "emergency_id", title: "Placa mascota" },
    });

    const res = await request(app).get("/api/entities/resolve/preprov1");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ exists: true, isClaimed: false, entityType: "emergency_id" });
  });

  it("normalizes slug casing", async () => {
    await prisma.entity.create({
      data: { slug: "mixedcase1", entityType: "menu", title: "Menu" },
    });

    const res = await request(app).get("/api/entities/resolve/MixedCase1");
    expect(res.status).toBe(200);
    expect(res.body.isClaimed).toBe(false);
  });

  it("returns the public payload for a claimed entity, with isOwner false for anonymous visitors", async () => {
    const { userId } = await registerAndGetToken("owner1@example.com");
    await prisma.entity.create({
      data: {
        slug: "claimed1",
        entityType: "vcard",
        title: "Tarjeta",
        userId,
        isClaimed: true,
        payload: { phone: "123" },
      },
    });

    const res = await request(app).get("/api/entities/resolve/claimed1");
    expect(res.status).toBe(200);
    expect(res.body.exists).toBe(true);
    expect(res.body.isClaimed).toBe(true);
    expect(res.body.entity.payload).toMatchObject({ phone: "123" });
    expect(res.body.entity.isOwner).toBe(false);
  });

  it("marks isOwner true when the authenticated visitor owns the entity", async () => {
    const { token, userId } = await registerAndGetToken("owner2@example.com");
    await prisma.entity.create({
      data: { slug: "claimed2", entityType: "catalog", title: "Catálogo", userId, isClaimed: true },
    });

    const res = await request(app)
      .get("/api/entities/resolve/claimed2")
      .set("Authorization", `Bearer ${token}`);

    expect(res.body.entity.isOwner).toBe(true);
  });

  it("rejects malformed slugs", async () => {
    const res = await request(app).get("/api/entities/resolve/a");
    expect(res.status).toBe(400);
  });
});

describe("POST /api/entities/claim", () => {
  it("requires authentication", async () => {
    const res = await request(app)
      .post("/api/entities/claim")
      .send({ slug: "newone1", entityType: "menu", title: "Menu" });
    expect(res.status).toBe(401);
  });

  it("creates and claims a brand-new slug", async () => {
    const { token, userId } = await registerAndGetToken("claimer1@example.com");

    const res = await request(app)
      .post("/api/entities/claim")
      .set("Authorization", `Bearer ${token}`)
      .send({ slug: "brandnew1", entityType: "vcard", title: "Mi Tarjeta" });

    expect(res.status).toBe(200);
    expect(res.body.entity).toMatchObject({
      slug: "brandnew1",
      isClaimed: true,
      entityType: "vcard",
      isOwner: true,
    });

    const stored = await prisma.entity.findUnique({ where: { slug: "brandnew1" } });
    expect(stored?.userId).toBe(userId);
  });

  it("claims a pre-provisioned unclaimed slug", async () => {
    await prisma.entity.create({
      data: { slug: "provisioned1", entityType: "sports_player", title: "Ficha" },
    });
    const { token, userId } = await registerAndGetToken("claimer2@example.com");

    const res = await request(app)
      .post("/api/entities/claim")
      .set("Authorization", `Bearer ${token}`)
      .send({ slug: "provisioned1", entityType: "sports_player", title: "Ficha actualizada" });

    expect(res.status).toBe(200);
    expect(res.body.entity.title).toBe("Ficha actualizada");

    const stored = await prisma.entity.findUnique({ where: { slug: "provisioned1" } });
    expect(stored?.isClaimed).toBe(true);
    expect(stored?.userId).toBe(userId);
  });

  it("rejects claiming an already-claimed slug", async () => {
    const first = await registerAndGetToken("first-owner@example.com");
    await request(app)
      .post("/api/entities/claim")
      .set("Authorization", `Bearer ${first.token}`)
      .send({ slug: "taken1", entityType: "menu", title: "Menu Uno" });

    const second = await registerAndGetToken("second-user@example.com");
    const res = await request(app)
      .post("/api/entities/claim")
      .set("Authorization", `Bearer ${second.token}`)
      .send({ slug: "taken1", entityType: "menu", title: "Intento" });

    expect(res.status).toBe(409);
  });

  it("end-to-end: unclaimed lookup -> register -> claim -> resolves as claimed", async () => {
    const lookup1 = await request(app).get("/api/entities/resolve/e2eflow1");
    expect(lookup1.status).toBe(404);

    const { token } = await registerAndGetToken("e2e@example.com");

    const claim = await request(app)
      .post("/api/entities/claim")
      .set("Authorization", `Bearer ${token}`)
      .send({ slug: "e2eflow1", entityType: "emergency_id", title: "ID de emergencia" });
    expect(claim.status).toBe(200);

    const lookup2 = await request(app).get("/api/entities/resolve/e2eflow1");
    expect(lookup2.status).toBe(200);
    expect(lookup2.body.isClaimed).toBe(true);
    expect(lookup2.body.entity.entityType).toBe("emergency_id");
  });

  it("rejects invalid entityType", async () => {
    const { token } = await registerAndGetToken("badtype@example.com");
    const res = await request(app)
      .post("/api/entities/claim")
      .set("Authorization", `Bearer ${token}`)
      .send({ slug: "badtype1", entityType: "not_a_type", title: "x" });
    expect(res.status).toBe(400);
  });
});

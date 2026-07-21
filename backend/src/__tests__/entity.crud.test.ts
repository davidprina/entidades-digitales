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

describe("POST /api/entities (create)", () => {
  it("creates a menu entity with a valid payload and auto-generated slug", async () => {
    const { token } = await registerAndGetToken("menu-owner@example.com");

    const res = await request(app)
      .post("/api/entities")
      .set("Authorization", `Bearer ${token}`)
      .send({
        entityType: "menu",
        title: "Café Central",
        payload: {
          categories: [
            { name: "Bebidas", items: [{ name: "Café", price: 2.5 }] },
            { name: "Postres", items: [{ name: "Flan", price: 3.2, description: "Casero" }] },
          ],
        },
      });

    expect(res.status).toBe(201);
    expect(res.body.entity.slug).toMatch(/^[a-z0-9]{7}$/);
    expect(res.body.entity.payload.categories).toHaveLength(2);
  });

  it("creates a vcard entity with a custom slug", async () => {
    const { token } = await registerAndGetToken("vcard-owner@example.com");

    const res = await request(app)
      .post("/api/entities")
      .set("Authorization", `Bearer ${token}`)
      .send({
        slug: "my-vcard-1",
        entityType: "vcard",
        title: "David Prina",
        payload: { fullName: "David Prina", phone: "+54 9 11 0000 0000", email: "David@Example.com" },
      });

    expect(res.status).toBe(201);
    expect(res.body.entity.payload.email).toBe("david@example.com");
  });

  it("rejects vcard payload without required fullName", async () => {
    const { token } = await registerAndGetToken("vcard-invalid@example.com");

    const res = await request(app)
      .post("/api/entities")
      .set("Authorization", `Bearer ${token}`)
      .send({ entityType: "vcard", title: "Sin nombre", payload: { phone: "123" } });

    expect(res.status).toBe(400);
  });

  it("rejects emergency_id payload without emergency contacts", async () => {
    const { token } = await registerAndGetToken("emg-invalid@example.com");

    const res = await request(app)
      .post("/api/entities")
      .set("Authorization", `Bearer ${token}`)
      .send({ entityType: "emergency_id", title: "Placa", payload: { medicalNotes: "Asma" } });

    expect(res.status).toBe(400);
  });

  it("creates a sports_team entity with players and next match", async () => {
    const { token } = await registerAndGetToken("team-owner@example.com");

    const res = await request(app)
      .post("/api/entities")
      .set("Authorization", `Bearer ${token}`)
      .send({
        entityType: "sports_team",
        title: "Deportivo San Martín",
        payload: {
          crestUrl: "https://example.com/crest.png",
          players: [{ number: 10, name: "Juan Pérez", position: "Mediocampista" }],
          nextMatch: { opponent: "Rival FC", date: "2026-08-01", venue: "Estadio Central" },
        },
      });

    expect(res.status).toBe(201);
    expect(res.body.entity.payload.players).toHaveLength(1);
  });

  it("creates a tournament entity with standings and fixture", async () => {
    const { token } = await registerAndGetToken("tournament-owner@example.com");

    const res = await request(app)
      .post("/api/entities")
      .set("Authorization", `Bearer ${token}`)
      .send({
        entityType: "tournament",
        title: "Torneo Nocturno 2026",
        payload: {
          standings: [{ team: "Los Halcones", played: 3, won: 2, drawn: 1, lost: 0, points: 7 }],
          fixture: [{ homeTeam: "Los Halcones", awayTeam: "Rival FC", date: "2026-08-05" }],
          topScorers: [{ player: "Juan Pérez", goals: 5 }],
        },
      });

    expect(res.status).toBe(201);
    expect(res.body.entity.payload.topScorers[0].goals).toBe(5);
  });

  it("creates a sports_player credential with emergency contact", async () => {
    const { token } = await registerAndGetToken("player-owner@example.com");

    const res = await request(app)
      .post("/api/entities")
      .set("Authorization", `Bearer ${token}`)
      .send({
        entityType: "sports_player",
        title: "Juan Pérez - #10",
        payload: {
          number: 10,
          position: "Mediocampista",
          stats: { goals: 5, assists: 3 },
          emergencyContact: { name: "María Pérez", phone: "+54 9 11 1111 1111", relationship: "Madre" },
        },
      });

    expect(res.status).toBe(201);
    expect(res.body.entity.payload.emergencyContact.name).toBe("María Pérez");
  });

  it("creates a catalog entity with products", async () => {
    const { token } = await registerAndGetToken("catalog-owner@example.com");

    const res = await request(app)
      .post("/api/entities")
      .set("Authorization", `Bearer ${token}`)
      .send({
        entityType: "catalog",
        title: "Tienda Ejemplo",
        payload: { products: [{ name: "Remera", price: 15000, imageUrl: "https://example.com/r.png" }] },
      });

    expect(res.status).toBe(201);
    expect(res.body.entity.payload.products[0].name).toBe("Remera");
  });

  it("creates an emergency_id entity with required contacts", async () => {
    const { token } = await registerAndGetToken("emg-owner@example.com");

    const res = await request(app)
      .post("/api/entities")
      .set("Authorization", `Bearer ${token}`)
      .send({
        entityType: "emergency_id",
        title: "Placa de Firulais",
        payload: {
          fullName: "Firulais",
          medicalNotes: "Alérgico a la penicilina",
          emergencyContacts: [{ name: "David", phone: "+54 9 11 2222 2222" }],
          whatsappNumber: "+5491122222222",
        },
      });

    expect(res.status).toBe(201);
    expect(res.body.entity.payload.emergencyContacts).toHaveLength(1);
  });

  it("rejects creating with a slug that's already in use", async () => {
    const { token } = await registerAndGetToken("dupslug@example.com");
    await request(app)
      .post("/api/entities")
      .set("Authorization", `Bearer ${token}`)
      .send({ slug: "dupe-slug-1", entityType: "menu", title: "Menu A", payload: { categories: [] } });

    const res = await request(app)
      .post("/api/entities")
      .set("Authorization", `Bearer ${token}`)
      .send({ slug: "dupe-slug-1", entityType: "menu", title: "Menu B", payload: { categories: [] } });

    expect(res.status).toBe(409);
  });

  it("requires authentication", async () => {
    const res = await request(app)
      .post("/api/entities")
      .send({ entityType: "menu", title: "x", payload: {} });
    expect(res.status).toBe(401);
  });
});

describe("PATCH /api/entities/:id (update, RBAC)", () => {
  async function createMenu(token: string) {
    const res = await request(app)
      .post("/api/entities")
      .set("Authorization", `Bearer ${token}`)
      .send({
        entityType: "menu",
        title: "Menu Original",
        payload: { categories: [{ name: "Bebidas", items: [{ name: "Agua", price: 1 }] }] },
      });
    return res.body.entity as { id: string };
  }

  it("lets the owner update title, payload and isActive", async () => {
    const { token } = await registerAndGetToken("update-owner@example.com");
    const entity = await createMenu(token);

    const res = await request(app)
      .patch(`/api/entities/${entity.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Menu Actualizado",
        isActive: false,
        payload: { categories: [{ name: "Comidas", items: [{ name: "Pizza", price: 10 }] }] },
      });

    expect(res.status).toBe(200);
    expect(res.body.entity.title).toBe("Menu Actualizado");
    expect(res.body.entity.isActive).toBe(false);
    expect(res.body.entity.payload.categories[0].name).toBe("Comidas");
  });

  it("rejects updates from a non-owner user", async () => {
    const owner = await registerAndGetToken("owner-a@example.com");
    const entity = await createMenu(owner.token);

    const intruder = await registerAndGetToken("intruder-a@example.com");
    const res = await request(app)
      .patch(`/api/entities/${entity.id}`)
      .set("Authorization", `Bearer ${intruder.token}`)
      .send({ title: "Hackeado" });

    expect(res.status).toBe(403);

    const stored = await prisma.entity.findUnique({ where: { id: entity.id } });
    expect(stored?.title).toBe("Menu Original");
  });

  it("rejects updates without authentication", async () => {
    const { token } = await registerAndGetToken("update-noauth@example.com");
    const entity = await createMenu(token);

    const res = await request(app).patch(`/api/entities/${entity.id}`).send({ title: "x" });
    expect(res.status).toBe(401);
  });

  it("returns 404 for a non-existent entity id", async () => {
    const { token } = await registerAndGetToken("update-404@example.com");
    const res = await request(app)
      .patch("/api/entities/00000000-0000-0000-0000-000000000000")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "x" });
    expect(res.status).toBe(404);
  });

  it("rejects invalid payload structure on update", async () => {
    const { token } = await registerAndGetToken("update-badpayload@example.com");
    const entity = await createMenu(token);

    const res = await request(app)
      .patch(`/api/entities/${entity.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ payload: { categories: [{ name: "Sin items" }] } });

    expect(res.status).toBe(400);
  });
});

describe("DELETE /api/entities/:id (RBAC)", () => {
  async function createCatalog(token: string) {
    const res = await request(app)
      .post("/api/entities")
      .set("Authorization", `Bearer ${token}`)
      .send({ entityType: "catalog", title: "Tienda", payload: { products: [] } });
    return res.body.entity as { id: string };
  }

  it("lets the owner delete their entity", async () => {
    const { token } = await registerAndGetToken("delete-owner@example.com");
    const entity = await createCatalog(token);

    const res = await request(app)
      .delete(`/api/entities/${entity.id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(204);

    const stored = await prisma.entity.findUnique({ where: { id: entity.id } });
    expect(stored).toBeNull();
  });

  it("rejects deletion from a non-owner user", async () => {
    const owner = await registerAndGetToken("owner-b@example.com");
    const entity = await createCatalog(owner.token);

    const intruder = await registerAndGetToken("intruder-b@example.com");
    const res = await request(app)
      .delete(`/api/entities/${entity.id}`)
      .set("Authorization", `Bearer ${intruder.token}`);
    expect(res.status).toBe(403);

    const stored = await prisma.entity.findUnique({ where: { id: entity.id } });
    expect(stored).not.toBeNull();
  });
});

describe("GET /api/entities/mine", () => {
  it("lists only the authenticated user's entities", async () => {
    const userA = await registerAndGetToken("mine-a@example.com");
    const userB = await registerAndGetToken("mine-b@example.com");

    await request(app)
      .post("/api/entities")
      .set("Authorization", `Bearer ${userA.token}`)
      .send({ entityType: "vcard", title: "A1", payload: { fullName: "A1" } });
    await request(app)
      .post("/api/entities")
      .set("Authorization", `Bearer ${userB.token}`)
      .send({ entityType: "vcard", title: "B1", payload: { fullName: "B1" } });

    const res = await request(app).get("/api/entities/mine").set("Authorization", `Bearer ${userA.token}`);

    expect(res.status).toBe(200);
    expect(res.body.entities).toHaveLength(1);
    expect(res.body.entities[0].title).toBe("A1");
  });
});

import request from "supertest";
import { createApp } from "../app";

const app = createApp();

describe("End-to-end: full entity lifecycle", () => {
  it("covers scan-of-unclaimed-code -> register -> claim -> public view -> edit -> deactivate -> delete -> 404 again", async () => {
    const slug = "e2e-lifecycle-1";

    // 1. Someone scans/searches a code that doesn't exist yet.
    const initialLookup = await request(app).get(`/api/entities/resolve/${slug}`);
    expect(initialLookup.status).toBe(404);
    expect(initialLookup.body).toMatchObject({ exists: false, isClaimed: false });

    // 2. They register an account.
    const register = await request(app).post("/api/auth/register").send({
      email: "lifecycle-owner@example.com",
      password: "supersecret123",
    });
    expect(register.status).toBe(201);
    const ownerToken = register.body.token as string;
    const ownerId = register.body.user.id as string;

    // 3. They claim the code, creating a new "menu" entity.
    const claim = await request(app)
      .post("/api/entities/claim")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ slug, entityType: "menu", title: "Café Central" });
    expect(claim.status).toBe(200);
    expect(claim.body.entity.isClaimed).toBe(true);
    expect(claim.body.entity.isOwner).toBe(true);
    const entityId = claim.body.entity.id as string;

    // 4. Anyone visiting the code now sees it as claimed with the public payload.
    const publicLookup = await request(app).get(`/api/entities/resolve/${slug}`);
    expect(publicLookup.status).toBe(200);
    expect(publicLookup.body.isClaimed).toBe(true);
    expect(publicLookup.body.entity.isOwner).toBe(false); // anonymous visitor

    // 5. The owner fills in the actual menu content.
    const update = await request(app)
      .patch(`/api/entities/${entityId}`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        payload: {
          categories: [{ name: "Bebidas", items: [{ name: "Café", price: 2.5 }] }],
        },
      });
    expect(update.status).toBe(200);

    // 6. The public view now reflects the updated payload.
    const lookupAfterUpdate = await request(app).get(`/api/entities/resolve/${slug}`);
    expect(lookupAfterUpdate.body.entity.payload.categories[0].name).toBe("Bebidas");

    // 7. A different user cannot edit or delete it.
    const otherUser = await request(app).post("/api/auth/register").send({
      email: "lifecycle-intruder@example.com",
      password: "supersecret123",
    });
    const intruderToken = otherUser.body.token as string;

    const intruderUpdate = await request(app)
      .patch(`/api/entities/${entityId}`)
      .set("Authorization", `Bearer ${intruderToken}`)
      .send({ title: "Hackeado" });
    expect(intruderUpdate.status).toBe(403);

    const intruderDelete = await request(app)
      .delete(`/api/entities/${entityId}`)
      .set("Authorization", `Bearer ${intruderToken}`);
    expect(intruderDelete.status).toBe(403);

    // 8. The owner deactivates it (still resolvable, but flagged inactive).
    const deactivate = await request(app)
      .patch(`/api/entities/${entityId}`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ isActive: false });
    expect(deactivate.body.entity.isActive).toBe(false);

    const lookupInactive = await request(app).get(`/api/entities/resolve/${slug}`);
    expect(lookupInactive.body.entity.isActive).toBe(false);

    // 9. The owner appears in their own dashboard listing.
    const mine = await request(app).get("/api/entities/mine").set("Authorization", `Bearer ${ownerToken}`);
    expect(mine.body.entities.map((e: { id: string }) => e.id)).toContain(entityId);
    expect(mine.body.entities[0].isOwner).toBe(true);
    void ownerId;

    // 10. The owner deletes the entity entirely.
    const del = await request(app)
      .delete(`/api/entities/${entityId}`)
      .set("Authorization", `Bearer ${ownerToken}`);
    expect(del.status).toBe(204);

    // 11. The code is free again.
    const finalLookup = await request(app).get(`/api/entities/resolve/${slug}`);
    expect(finalLookup.status).toBe(404);
  });
});

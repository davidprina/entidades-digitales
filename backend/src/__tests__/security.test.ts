import express from "express";
import request from "supertest";
import { createApp } from "../app";
import { authRateLimiter } from "../middleware/rateLimit";
import { prisma } from "../lib/prisma";

const app = createApp();

async function registerAndGetToken(email: string): Promise<{ token: string; userId: string }> {
  const res = await request(app).post("/api/auth/register").send({
    email,
    password: "supersecret123",
  });
  return { token: res.body.token as string, userId: res.body.user.id as string };
}

describe("Security audit", () => {
  it("never leaks the password hash in any auth response", async () => {
    const register = await request(app)
      .post("/api/auth/register")
      .send({ email: "secure1@example.com", password: "supersecret123" });
    expect(JSON.stringify(register.body)).not.toMatch(/passwordHash|password_hash/i);

    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: "secure1@example.com", password: "supersecret123" });
    expect(JSON.stringify(login.body)).not.toMatch(/passwordHash|password_hash/i);

    const me = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${login.body.token}`);
    expect(JSON.stringify(me.body)).not.toMatch(/passwordHash|password_hash/i);
  });

  it("stores passwords hashed, never in plaintext", async () => {
    await request(app).post("/api/auth/register").send({
      email: "secure2@example.com",
      password: "supersecret123",
    });
    const user = await prisma.user.findUniqueOrThrow({ where: { email: "secure2@example.com" } });
    expect(user.passwordHash).not.toBe("supersecret123");
    expect(user.passwordHash).toMatch(/^\$2[aby]\$/); // bcrypt hash prefix
  });

  it("rejects a tampered JWT signature", async () => {
    const { token } = await registerAndGetToken("secure3@example.com");
    const tampered = token.slice(0, -4) + "AAAA";

    const res = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${tampered}`);
    expect(res.status).toBe(401);
  });

  it("rejects a JWT signed with a different secret", async () => {
    const jwt = require("jsonwebtoken");
    const forged = jwt.sign({ sub: "00000000-0000-0000-0000-000000000000", email: "x@x.com" }, "wrong-secret");

    const res = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${forged}`);
    expect(res.status).toBe(401);
  });

  it("ignores a client-supplied userId/isClaimed when creating an entity (mass assignment)", async () => {
    const attacker = await registerAndGetToken("secure4@example.com");
    const victim = await registerAndGetToken("secure5@example.com");

    const res = await request(app)
      .post("/api/entities")
      .set("Authorization", `Bearer ${attacker.token}`)
      .send({
        entityType: "vcard",
        title: "Intento de suplantación",
        payload: { fullName: "x" },
        userId: victim.userId,
        isClaimed: false,
        id: "11111111-1111-1111-1111-111111111111",
      });

    expect(res.status).toBe(201);
    const stored = await prisma.entity.findUniqueOrThrow({ where: { id: res.body.entity.id } });
    expect(stored.userId).toBe(attacker.userId);
    expect(stored.isClaimed).toBe(true);
  });

  it("does not allow a non-owner to escalate by changing entityType via PATCH", async () => {
    const owner = await registerAndGetToken("secure6@example.com");
    const created = await request(app)
      .post("/api/entities")
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ entityType: "vcard", title: "Original", payload: { fullName: "x" } });

    const intruder = await registerAndGetToken("secure7@example.com");
    const res = await request(app)
      .patch(`/api/entities/${created.body.entity.id}`)
      .set("Authorization", `Bearer ${intruder.token}`)
      .send({ entityType: "menu", payload: { categories: [] } });

    expect(res.status).toBe(403);
    const stored = await prisma.entity.findUniqueOrThrow({ where: { id: created.body.entity.id } });
    expect(stored.entityType).toBe("vcard");
  });

  it("rejects oversized request bodies", async () => {
    const { token } = await registerAndGetToken("secure8@example.com");
    const hugeDescription = "x".repeat(300 * 1024); // 300kb, over the 256kb limit

    const res = await request(app)
      .post("/api/entities")
      .set("Authorization", `Bearer ${token}`)
      .send({
        entityType: "vcard",
        title: "Payload gigante",
        payload: { fullName: "x", company: hugeDescription },
      });

    expect(res.status).toBe(413);
  });

  it("does not evaluate slugs with path-traversal-like or script-like input as valid", async () => {
    const res1 = await request(app).get("/api/entities/resolve/..%2F..%2Fetc%2Fpasswd");
    expect(res1.status).toBe(400);

    const res2 = await request(app).get(
      `/api/entities/resolve/${encodeURIComponent('<script>alert(1)</script>')}`,
    );
    expect(res2.status).toBe(400);
  });

  it("rate-limits repeated auth requests from the same client", async () => {
    const testApp = express();
    testApp.use(express.json());
    testApp.use("/limited", authRateLimiter, (_req, res) => res.status(200).json({ ok: true }));

    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    try {
      let lastStatus = 200;
      for (let i = 0; i < 21; i++) {
        const res = await request(testApp).get("/limited");
        lastStatus = res.status;
      }
      expect(lastStatus).toBe(429);
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });
});

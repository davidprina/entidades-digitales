import request from "supertest";
import { createApp } from "../src/app";
import { prisma } from "../src/lib/prisma";

const app = createApp();

const validUser = { email: "player@example.com", password: "supersecret123" };

describe("GET /health", () => {
  it("responds ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});

describe("POST /api/auth/register", () => {
  it("creates a user and returns tokens", async () => {
    const res = await request(app).post("/api/auth/register").send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({ email: validUser.email });
    expect(res.body.user).not.toHaveProperty("passwordHash");
    expect(typeof res.body.accessToken).toBe("string");
    expect(typeof res.body.refreshToken).toBe("string");

    const stored = await prisma.user.findUnique({ where: { email: validUser.email } });
    expect(stored).not.toBeNull();
    expect(stored?.passwordHash).not.toBe(validUser.password);
  });

  it("rejects duplicate emails", async () => {
    await request(app).post("/api/auth/register").send(validUser);
    const res = await request(app).post("/api/auth/register").send(validUser);

    expect(res.status).toBe(409);
    expect(res.body.error).toBe("ConflictError");
  });

  it("rejects invalid email", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "not-an-email", password: "supersecret123" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("ValidationError");
  });

  it("rejects short passwords", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "shortpass@example.com", password: "123" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("ValidationError");
  });

  it("normalizes email casing", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "MixedCase@Example.com", password: "supersecret123" });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe("mixedcase@example.com");
  });
});

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await request(app).post("/api/auth/register").send(validUser);
  });

  it("logs in with correct credentials", async () => {
    const res = await request(app).post("/api/auth/login").send(validUser);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(validUser.email);
    expect(typeof res.body.accessToken).toBe("string");
    expect(typeof res.body.refreshToken).toBe("string");
  });

  it("rejects wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: validUser.email, password: "wrongpassword" });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("UnauthorizedError");
  });

  it("rejects unknown email", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@example.com", password: "whatever123" });

    expect(res.status).toBe(401);
  });
});

describe("GET /api/auth/me", () => {
  it("returns the current user with a valid access token", async () => {
    const registerRes = await request(app).post("/api/auth/register").send(validUser);
    const { accessToken } = registerRes.body;

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(validUser.email);
  });

  it("rejects requests without a token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("rejects requests with a malformed token", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer not-a-real-token");

    expect(res.status).toBe(401);
  });
});

describe("POST /api/auth/refresh", () => {
  it("issues a new token pair and rotates the refresh token", async () => {
    const registerRes = await request(app).post("/api/auth/register").send(validUser);
    const { refreshToken } = registerRes.body;

    const res = await request(app).post("/api/auth/refresh").send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.refreshToken).not.toBe(refreshToken);

    const reuse = await request(app).post("/api/auth/refresh").send({ refreshToken });
    expect(reuse.status).toBe(401);
  });

  it("rejects an unknown refresh token", async () => {
    const res = await request(app)
      .post("/api/auth/refresh")
      .send({ refreshToken: "does-not-exist" });

    expect(res.status).toBe(401);
  });
});

describe("POST /api/auth/logout", () => {
  it("revokes the refresh token so it can no longer be used", async () => {
    const registerRes = await request(app).post("/api/auth/register").send(validUser);
    const { refreshToken } = registerRes.body;

    const logoutRes = await request(app).post("/api/auth/logout").send({ refreshToken });
    expect(logoutRes.status).toBe(204);

    const res = await request(app).post("/api/auth/refresh").send({ refreshToken });
    expect(res.status).toBe(401);
  });
});

import request from "supertest";
import { createApp } from "../app";
import { prisma } from "../lib/prisma";

const app = createApp();

describe("POST /api/auth/register", () => {
  it("creates a new user and returns a token", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "player@example.com",
      password: "supersecret123",
    });

    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({ email: "player@example.com" });
    expect(res.body.user).not.toHaveProperty("passwordHash");
    expect(typeof res.body.token).toBe("string");

    const stored = await prisma.user.findUnique({
      where: { email: "player@example.com" },
    });
    expect(stored).not.toBeNull();
    expect(stored?.passwordHash).not.toBe("supersecret123");
  });

  it("normalizes email casing/whitespace", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "  Coach@Example.com ",
      password: "supersecret123",
    });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe("coach@example.com");
  });

  it("rejects duplicate emails", async () => {
    await request(app).post("/api/auth/register").send({
      email: "dup@example.com",
      password: "supersecret123",
    });

    const res = await request(app).post("/api/auth/register").send({
      email: "dup@example.com",
      password: "anotherpassword",
    });

    expect(res.status).toBe(409);
  });

  it("rejects invalid email", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "not-an-email",
      password: "supersecret123",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("validation_error");
  });

  it("rejects short passwords", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "shortpw@example.com",
      password: "short",
    });

    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await request(app).post("/api/auth/register").send({
      email: "login@example.com",
      password: "correcthorse123",
    });
  });

  it("logs in with correct credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "login@example.com",
      password: "correcthorse123",
    });

    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe("string");
    expect(res.body.user.email).toBe("login@example.com");
  });

  it("rejects incorrect password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "login@example.com",
      password: "wrongpassword",
    });

    expect(res.status).toBe(401);
  });

  it("rejects unknown email", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "nobody@example.com",
      password: "correcthorse123",
    });

    expect(res.status).toBe(401);
  });
});

describe("GET /api/auth/me", () => {
  async function registerAndGetToken(): Promise<string> {
    const res = await request(app).post("/api/auth/register").send({
      email: "me@example.com",
      password: "supersecret123",
    });
    return res.body.token as string;
  }

  it("returns the authenticated user's profile", async () => {
    const token = await registerAndGetToken();

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("me@example.com");
  });

  it("rejects requests without a token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("rejects requests with an invalid token", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer not-a-real-token");

    expect(res.status).toBe(401);
  });
});

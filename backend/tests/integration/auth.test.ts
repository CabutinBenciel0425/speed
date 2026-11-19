import { beforeAll, describe, expect, it, vi } from "vitest";
import request from "supertest";
import mongoose from "mongoose";

const { redisClient } = await vi.hoisted(async () => {
  const { createFakeRedis } = await import("../helpers/fakeRedis.js");
  return createFakeRedis();
});
vi.mock("../../lib/redis.js", () => ({ redisClient }));

vi.mock("../../utils/sendEmail.js", () => ({
  sendEmail: vi.fn().mockResolvedValue({}),
}));

vi.mock("../../server.js", () => ({
  io: { to: () => ({ emit: vi.fn(), fetchSockets: async () => [] }) },
}));

import { app } from "../../app.js";
import User from "../../models/user.model.js";
import { createUser, loginAs, TEST_PASSWORD } from "../helpers/users.js";

beforeAll(async () => {
  await Promise.all(Object.values(mongoose.models).map((m) => m.init()));
});

const validSignup = {
  firstName: "Juan",
  lastName: "Dela Cruz",
  email: "juan@example.com",
  password: TEST_PASSWORD,
  phoneNumber: "09123456789",
};

describe("POST /api/v1/auth/sign-up/customer", () => {
  it("creates a customer with a hashed password", async () => {
    const res = await request(app)
      .post("/api/v1/auth/sign-up/customer")
      .send(validSignup);

    expect(res.status).toBe(201);
    const saved = await User.findOne({ email: validSignup.email });
    expect(saved).not.toBeNull();
    expect(saved!.password).not.toBe(TEST_PASSWORD);
  });

  it("rejects a duplicate email with 409", async () => {
    await request(app).post("/api/v1/auth/sign-up/customer").send(validSignup);
    const res = await request(app)
      .post("/api/v1/auth/sign-up/customer")
      .send(validSignup);
    expect(res.status).toBe(409);
  });

  it("rejects a weak password with 400", async () => {
    const res = await request(app)
      .post("/api/v1/auth/sign-up/customer")
      .send({ ...validSignup, password: "abc" });
    expect(res.status).toBe(400);
  });
});

describe("POST /api/v1/auth/login", () => {
  it("logs in and sets both auth cookies", async () => {
    const user = await createUser("Customer");
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: user.email, password: TEST_PASSWORD });

    expect(res.status).toBe(200);
    const cookies = (res.headers["set-cookie"] as unknown as string[]).join(
      ";",
    );
    expect(cookies).toContain("accessToken=");
    expect(cookies).toContain("refreshToken=");
  });

  it("stores the refresh token in redis", async () => {
    const user = await createUser("Customer");
    await request(app)
      .post("/api/v1/auth/login")
      .send({ email: user.email, password: TEST_PASSWORD });

    expect(redisClient.set).toHaveBeenCalledWith(
      `refresh_token:${user._id}-Customer`,
      expect.any(String),
      "EX",
      7 * 24 * 60 * 60,
    );
  });

  it("rejects a wrong password with 401", async () => {
    const user = await createUser("Customer");
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: user.email, password: "WrongPass123" });
    expect(res.status).toBe(401);
  });

  it("asks a multi-role user to select a role", async () => {
    const user = await createUser("Customer", { role: ["Customer", "Driver"] });
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: user.email, password: TEST_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.requiresRoleSelection).toBe(true);
    expect(res.body.roles).toEqual(["Customer", "Driver"]);
  });
});

describe("GET /api/v1/auth/profile", () => {
  it("rejects a request without a cookie", async () => {
    const res = await request(app).get("/api/v1/auth/profile");
    expect(res.status).toBe(401);
  });

  it("returns the profile when logged in", async () => {
    const user = await createUser("Customer");
    const agent = await loginAs(app, user.email);
    const res = await agent.get("/api/v1/auth/profile");

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(user.email);
    expect(res.body.data.activeRole).toBe("Customer");
  });

  it("rejects a soft-deleted user", async () => {
    const user = await createUser("Customer");
    const agent = await loginAs(app, user.email);
    await User.updateOne({ _id: user._id }, { isDeleted: true });

    const res = await agent.get("/api/v1/auth/profile");
    expect(res.status).toBe(401);
  });
});

describe("role guards", () => {
  it("blocks a customer from an admin route", async () => {
    const user = await createUser("Customer");
    const agent = await loginAs(app, user.email);
    const res = await agent.get("/api/v1/admin/users");
    expect(res.status).toBe(401);
  });

  it("lets an admin into an admin route", async () => {
    const admin = await createUser("Admin");
    const agent = await loginAs(app, admin.email);
    const res = await agent.get("/api/v1/admin/users");
    expect(res.status).toBe(200);
  });
});

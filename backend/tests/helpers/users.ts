import request from "supertest";
import type { Express } from "express";
import User from "../../models/user.model.js";

export const TEST_PASSWORD = "Password123";
let counter = 0;

export const createUser = async (
  role: "Customer" | "Merchant" | "Driver" | "Admin" = "Customer",
  overrides: Record<string, unknown> = {},
) => {
  counter += 1;
  return User.create({
    firstName: "Test",
    lastName: role,
    email: `${role.toLowerCase()}${counter}@example.com`,
    password: TEST_PASSWORD,
    phoneNumber: "09123456789",
    role: [role],
    isVerified: true,
    ...overrides,
  });
};

export const loginAs = async (app: Express, email: string) => {
  const agent = request.agent(app);
  const res = await agent
    .post("/api/v1/auth/login")
    .send({ email, password: TEST_PASSWORD });
  if (res.status !== 200) {
    throw new Error(`Login failed: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return agent;
};

import { beforeAll, describe, expect, it, vi } from "vitest";
import request from "supertest";
import mongoose from "mongoose";

const { redisClient } = await vi.hoisted(async () => {
  const { createFakeRedis } = await import("../helpers/fakeRedis.js");
  return createFakeRedis();
});
vi.mock("../../lib/redis.js", () => ({ redisClient }));

vi.mock("../../server.js", () => ({
  io: { to: () => ({ emit: vi.fn(), fetchSockets: async () => [] }) },
}));

import { app } from "../../app.js";
import { createUser, TEST_PASSWORD } from "../helpers/users.js";

const validAddress = {
  user: "6a63115ceb66a11d1d840706",
  label: "Home",
  recipientName: "Benciel Cabutin",
  phoneNumber: "09923383623",
  houseOrUnitNumber: "Building 4 Unit 104",
  street: "FTI MRB Habitat",
  barangay: "Western Bicutan",
  city: "City of Taguig",
  province: "Metro Manila",
  region: "NCR",
  location: {
    type: "Point",
    coordinates: ["121.04321103781386", "14.508571097884666"],
  },
  landmark: "Near Hospital",
  instructions: "Just ring the doorbell",
  //isDefault
};

const loginAndGetCookies = async (email: string) => {
  const loginRes = await request(app)
    .post("/api/v1/auth/login")
    .send({ email, password: TEST_PASSWORD });
  return loginRes.headers["set-cookie"];
};

describe("GET /api/v1/address", () => {
  it("rejects the GET request - no logged in", async () => {
    const res = await request(app).get("/api/v1/address");
    expect(res.status).toBe(401);
  });

  it("returns an empty list of address of newly signed up customer", async () => {
    const user = await createUser("Customer");
    const cookies = await loginAndGetCookies(user.email);

    const res = await request(app)
      .get("/api/v1/address")
      .set("Cookie", cookies);

    expect(res.body.data).toEqual([]);
  });

  it("adding first address", async () => {
    const user = await createUser("Customer");
    const cookies = await loginAndGetCookies(user.email);

    const res = await request(app)
      .post("/api/v1/address")
      .set("Cookie", cookies)
      .send(validAddress);

    expect(res.status).toBe(201);
    expect(res.body.data.isDefault).toBe(true);
    expect(res.body.data.user._id.toString()).toStrictEqual(
      user._id.toString(),
    );
  });

  it("adding second address - but not the default", async () => {
    const user = await createUser("Customer");
    const cookies = await loginAndGetCookies(user.email);

    const res1 = await request(app)
      .post("/api/v1/address")
      .set("Cookie", cookies)
      .send(validAddress);

    const res2 = await request(app)
      .post("/api/v1/address")
      .set("Cookie", cookies)
      .send({ ...validAddress, label: "Work" });

    expect(res1.body.data.isDefault).toBe(true);
    expect(res2.body.data.isDefault).toBe(false);
  });

  it("adding address with same label twice", async () => {
    const user = await createUser("Customer");
    const cookies = await loginAndGetCookies(user.email);

    await request(app)
      .post("/api/v1/address")
      .set("Cookie", cookies)
      .send(validAddress);

    const res2 = await request(app)
      .post("/api/v1/address")
      .set("Cookie", cookies)
      .send(validAddress);

    const addressRes = await request(app)
      .get("/api/v1/address")
      .set("Cookie", cookies);

    expect(res2.status).toBe(409);
    expect(addressRes.body.data.length).toBe(1);
  });

  it("testing the limit of 3 addresses", async () => {
    const user = await createUser("Customer");
    const cookies = await loginAndGetCookies(user.email);

    await request(app)
      .post("/api/v1/address")
      .set("Cookie", cookies)
      .send({ ...validAddress, label: "Home" });

    await request(app)
      .post("/api/v1/address")
      .set("Cookie", cookies)
      .send({ ...validAddress, label: "Work" });

    await request(app)
      .post("/api/v1/address")
      .set("Cookie", cookies)
      .send({ ...validAddress, label: "Other" });

    const res4 = await request(app)
      .post("/api/v1/address")
      .set("Cookie", cookies)
      .send({ ...validAddress, label: "Other" });

    expect(res4.status).toBe(409);
  });

  it("wrong phone number format", async () => {
    const user = await createUser("Customer");
    const cookies = await loginAndGetCookies(user.email);

    const res = await request(app)
      .post("/api/v1/address")
      .set("Cookie", cookies)
      .send({ ...validAddress, phoneNumber: "09123456" });

    expect(res.status).toBe(400);
  });

  it("missing required field", async () => {
    const user = await createUser("Customer");
    const cookies = await loginAndGetCookies(user.email);

    const res = await request(app)
      .post("/api/v1/address")
      .set("Cookie", cookies)
      .send({ ...validAddress, region: "" });

    expect(res.status).toBe(400);
  });

  it("adding second address - also replacing the default", async () => {
    const user = await createUser("Customer");
    const cookies = await loginAndGetCookies(user.email);

    await request(app)
      .post("/api/v1/address")
      .set("Cookie", cookies)
      .send({ ...validAddress, label: "Home" });

    await request(app)
      .post("/api/v1/address")
      .set("Cookie", cookies)
      .send({ ...validAddress, label: "Work", isDefault: true });

    const resAddresses = await request(app)
      .get("/api/v1/address")
      .set("Cookie", cookies);

    const workAddress = resAddresses.body.data.find(
      (address: any) => address.label === "Work",
    );
    const homeAddress = resAddresses.body.data.find(
      (address: any) => address.label === "Home",
    );

    expect(workAddress.isDefault).toBe(true);
    expect(homeAddress.isDefault).toBe(false);
  });

  it("toggling another default address", async () => {
    const user = await createUser("Customer");
    const cookies = await loginAndGetCookies(user.email);

    await request(app)
      .post("/api/v1/address")
      .set("Cookie", cookies)
      .send({ ...validAddress, label: "Home", isDefault: true });

    await request(app)
      .post("/api/v1/address")
      .set("Cookie", cookies)
      .send({ ...validAddress, label: "Work" });

    const resAddresses = await request(app)
      .patch("/api/v1/address/Work")
      .set("Cookie", cookies);

    const workAddress = resAddresses.body.data.find(
      (address: any) => address.label === "Work",
    );
    const homeAddress = resAddresses.body.data.find(
      (address: any) => address.label === "Home",
    );

    expect(workAddress).toEqual(
      expect.objectContaining({ label: "Work", isDefault: true }),
    );
    expect(homeAddress).toEqual(
      expect.objectContaining({ label: "Home", isDefault: false }),
    );
  });

  it("adding two address - deleting the default", async () => {
    const user = await createUser("Customer");
    const cookies = await loginAndGetCookies(user.email);

    await request(app)
      .post("/api/v1/address")
      .set("Cookie", cookies)
      .send({ ...validAddress, label: "Home", isDefault: true });

    await request(app)
      .post("/api/v1/address")
      .set("Cookie", cookies)
      .send({ ...validAddress, label: "Work" });

    const resDeleted = await request(app)
      .delete("/api/v1/address/Home")
      .set("Cookie", cookies);

    const addresses = await request(app)
      .get("/api/v1/address")
      .set("Cookie", cookies);

    expect(resDeleted.status).toBe(200);
    expect(resDeleted.body.success).toBe(true);
    expect(resDeleted.body.message).toBe("Address successfully deleted");
    expect(addresses.body.data).toHaveLength(1);
    expect(addresses.body.data[0]).toEqual(
      expect.objectContaining({ label: "Work", isDefault: true }),
    );
  });

  it("privacy between users", async () => {
    const user1 = await createUser("Customer");
    const user2 = await createUser("Customer");
    const cookies1 = await loginAndGetCookies(user1.email);

    await request(app)
      .post("/api/v1/address")
      .set("Cookie", cookies1)
      .send({ ...validAddress, label: "Home", isDefault: true });

    const cookies2 = await loginAndGetCookies(user2.email);

    const addresses = await request(app)
      .get("/api/v1/address")
      .set("Cookie", cookies2);

    expect(addresses.body.data.length).toBe(0);
  });
});

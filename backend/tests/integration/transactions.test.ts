import mongoose from "mongoose";
import { it, expect } from "vitest";

it("supports transactions", async () => {
  const session = await mongoose.startSession();
  const ping = mongoose.connection.db!.collection("ping");

  try {
    await session.withTransaction(async () => {
      await ping.insertOne({ a: 1 }, { session });
    });
  } finally {
    await session.endSession();
  }

  expect(await ping.countDocuments({ a: 1 })).toBe(1);
});

it("rolls back when the callback throws", async () => {
  const session = await mongoose.startSession();
  const ping = mongoose.connection.db!.collection("ping");

  await expect(
    session.withTransaction(async () => {
      await ping.insertOne({ b: 1 }, { session });
      throw new Error("boom");
    }),
  ).rejects.toThrow("boom");
  await session.endSession();

  expect(await ping.countDocuments({ b: 1 })).toBe(0);
});

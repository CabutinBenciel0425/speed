import { vi } from "vitest";

vi.mock("../lib/redis.js", () => ({
  redisClient: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    on: vi.fn(),

    call: vi.fn(async (command: string) =>
      command.toUpperCase() === "SCRIPT" ? "test-sha" : [1, 60_000],
    ),
  },
}));

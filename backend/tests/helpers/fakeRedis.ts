import { vi } from "vitest";

export const createFakeRedis = () => {
  const store = new Map<string, string>();
  return {
    store,
    redisClient: {
      get: vi.fn(async (k: string) => store.get(k) ?? null),
      set: vi.fn(async (k: string, v: string) => {
        store.set(k, v);
        return "OK";
      }),
      del: vi.fn(async (k: string) => (store.delete(k) ? 1 : 0)),
      exists: vi.fn(async (k: string) => (store.has(k) ? 1 : 0)),
      on: vi.fn(),
      call: vi.fn(async (command: string) =>
        command.toUpperCase() === "SCRIPT" ? "test-sha" : [1, 60_000],
      ),
    },
  };
};

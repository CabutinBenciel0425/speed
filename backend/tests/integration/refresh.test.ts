import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { app } from "../../app";
import { redisClient } from "../../lib/redis.js";

const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET_KEY ?? "";

const signRefreshToken = (
  payload: Record<string, unknown> = {
    userId: "user123",
    activeRole: "Customer",
  },
  secret: string = REFRESH_SECRET,
  expiresInSeconds = 60 * 60,
) => jwt.sign(payload, secret, { expiresIn: expiresInSeconds });

const refresh = (refreshToken?: string) => {
  const req = request(app).post("/api/v1/auth/refresh");
  return refreshToken
    ? req.set("Cookie", [`refreshToken=${refreshToken}`])
    : req;
};

const cookiesOf = (res: { headers: Record<string, unknown> }): string[] => {
  const header = res.headers["set-cookie"];
  return Array.isArray(header) ? (header as string[]) : [];
};

const expectAuthCookiesCleared = (res: {
  headers: Record<string, unknown>;
}) => {
  const cookies = cookiesOf(res);
  expect(cookies).toContainEqual(expect.stringMatching(/^refreshToken=;/));
  expect(cookies).toContainEqual(expect.stringMatching(/^accessToken=;/));
};

describe("POST /api/v1/auth/refresh", () => {
  beforeEach(() => {
    vi.mocked(redisClient.get).mockReset();
  });

  it("returns 401 and clears cookies when no refresh token is sent", async () => {
    const res = await refresh();

    expect(res.status).toBe(401);
    expectAuthCookiesCleared(res);
    expect(redisClient.get).not.toHaveBeenCalled();
  });

  it("returns 401 and clears cookies for a malformed token", async () => {
    const res = await refresh("not-a-jwt");

    expect(res.status).toBe(401);
    expectAuthCookiesCleared(res);
  });

  it("returns 401 and clears cookies for an expired token", async () => {
    const res = await refresh(signRefreshToken(undefined, REFRESH_SECRET, -10));

    expect(res.status).toBe(401);
    expectAuthCookiesCleared(res);
  });

  it("returns 401 and clears cookies for a token signed with the wrong secret", async () => {
    const res = await refresh(signRefreshToken(undefined, "some-other-secret"));

    expect(res.status).toBe(401);
    expectAuthCookiesCleared(res);
  });

  it("returns 401 and clears cookies when the payload has an invalid role", async () => {
    const res = await refresh(
      signRefreshToken({ userId: "user123", activeRole: "Hacker" }),
    );

    expect(res.status).toBe(401);
    expectAuthCookiesCleared(res);
  });

  it("returns 401 and clears cookies when the token is no longer in Redis", async () => {
    vi.mocked(redisClient.get).mockResolvedValue(null);

    const res = await refresh(signRefreshToken());

    expect(res.status).toBe(401);
    expectAuthCookiesCleared(res);
    expect(redisClient.get).toHaveBeenCalledWith(
      "refresh_token:user123-Customer",
    );
  });

  it("returns 401 and clears cookies when Redis holds a different token", async () => {
    vi.mocked(redisClient.get).mockResolvedValue("a-different-token");

    const res = await refresh(signRefreshToken());

    expect(res.status).toBe(401);
    expectAuthCookiesCleared(res);
  });
});

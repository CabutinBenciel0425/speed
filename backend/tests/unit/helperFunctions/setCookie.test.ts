import { describe, expect, test, vi } from "vitest";
import {
  setAccessToken,
  setRefreshToken,
  setTempToken,
} from "../../../utils/setCookie";

describe("Cookie setters", () => {
  const mockRes = { cookie: vi.fn() } as any;

  test("sets the access token with correct options", () => {
    setAccessToken(mockRes, "fake-access-token");
    expect(mockRes.cookie).toHaveBeenCalledWith(
      "accessToken",
      "fake-access-token",
      expect.objectContaining({
        httpOnly: true,
        path: "/",
        maxAge: 15 * 60 * 1000,
      }),
    );
  });

  test("sets the refresh token with correct options", () => {
    setRefreshToken(mockRes, "fake-refresh-token");
    expect(mockRes.cookie).toHaveBeenCalledWith(
      "refreshToken",
      "fake-refresh-token",
      expect.objectContaining({
        httpOnly: true,
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      }),
    );
  });

  test("sets the temp token with correct options", () => {
    setTempToken(mockRes, "fake-temp-token");
    expect(mockRes.cookie).toHaveBeenCalledWith(
      "tempToken",
      "fake-temp-token",
      expect.objectContaining({
        httpOnly: true,
        path: "/",
        maxAge: 5 * 60 * 1000,
      }),
    );
  });

  test("sets secure cookies in production", () => {});
});

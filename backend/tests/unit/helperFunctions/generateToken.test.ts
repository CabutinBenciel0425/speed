import { describe, expect, test } from "vitest";
import {
  createAccessToken,
  createRefreshToken,
  createTempToken,
} from "../../../utils/generateToken";
import jwt from "jsonwebtoken";

describe("Generating JWT tokens", () => {
  const userId = "user123";
  const role = "Admin";

  test("return a string", () => {
    const accessToken = createAccessToken("user123", "Admin");
    const refreshToken = createRefreshToken("user123", "Admin");
    const tempToken = createTempToken("user123");

    expect(accessToken).toBeTypeOf("string");
    expect(refreshToken).toBeTypeOf("string");
    expect(tempToken).toBeTypeOf("string");
  });

  test("creates a valid Access Token", () => {
    const token = createAccessToken(userId, role);
    const secret = process.env.ACCESS_TOKEN_SECRET_KEY as string;

    const decoded = jwt.verify(token, secret) as any;

    expect(decoded.userId).toBe(userId);
    expect(decoded.activeRole).toBe(role);

    expect(decoded.exp - decoded.iat).toBe(900);
  });

  test("creates a valid Refresh Token", () => {
    const token = createRefreshToken(userId, role);
    const secret = process.env.REFRESH_TOKEN_SECRET_KEY as string;

    const decoded = jwt.verify(token, secret) as any;

    expect(decoded.userId).toBe(userId);
    expect(decoded.activeRole).toBe(role);

    expect(decoded.exp - decoded.iat).toBe(604800);
  });

  test("creates a valid Temp Token without a role", () => {
    const token = createTempToken(userId);
    const secret = process.env.TEMP_TOKEN_SECRET_KEY as string;
    const decoded = jwt.verify(token, secret) as any;

    expect(decoded.userId).toBe(userId);
    expect(decoded.activeRole).toBeUndefined();

    expect(decoded.exp - decoded.iat).toBe(300);
  });
});

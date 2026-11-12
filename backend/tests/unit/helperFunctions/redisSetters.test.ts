import { describe, expect, test, vi } from "vitest";
import { storePasswordResetToken } from "../../../utils/storePasswordResetToken";
import { redisClient } from "../../../lib/redis";
import { storeRefreshToken } from "../../../utils/storeRefreshToken";
import { storeVerificationToken } from "../../../utils/storeVerificationToken";

vi.mock("../../../lib/redis.js", () => ({
  redisClient: {
    set: vi.fn(),
  },
}));

describe("Redis setters", () => {
  test("set password reset token in redis with valid options", async () => {
    vi.mocked(redisClient.set).mockResolvedValueOnce("OK" as any);
    await storePasswordResetToken("test@test.com", "123456");

    expect(redisClient.set).toHaveBeenCalledWith(
      "passwordReset:test@test.com",
      "123456",
      "EX",
      15 * 60,
    );
  });

  test("set refresh token in redis with valid options", async () => {
    vi.mocked(redisClient.set).mockResolvedValueOnce("OK" as any);
    await storeRefreshToken("123", "Customer", "123456");

    expect(redisClient.set).toHaveBeenCalledWith(
      "refresh_token:123-Customer",
      "123456",
      "EX",
      7 * 24 * 60 * 60,
    );
  });

  test("set verification token in redis with valid options", async () => {
    vi.mocked(redisClient.set).mockResolvedValueOnce("OK" as any);
    await storeVerificationToken("test@test.com", "123456");

    expect(redisClient.set).toHaveBeenCalledWith(
      "verificationToken:test@test.com",
      "123456",
      "EX",
      24 * 60 * 60,
    );
  });
});

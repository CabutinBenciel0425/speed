import { redisClient } from "../lib/redis.js";

export const storePasswordResetToken = async (
  email: string,
  resetToken: string,
) => {
  await redisClient.set(
    `passwordReset:${email}`,
    resetToken,
    "EX",
    15 * 60, // 15 minutes
  );
};

import { redisClient } from "../lib/redis.js";

export const storeRefreshToken = async (
  userId: string,
  refreshToken: string,
) => {
  await redisClient.set(
    `refresh_token:${userId}`,
    refreshToken,
    "EX",
    7 * 24 * 60 * 60, //7days
  );
};

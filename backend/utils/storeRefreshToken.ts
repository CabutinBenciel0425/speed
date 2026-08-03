import { redisClient } from "../lib/redis.js";
import type { ValidUserRoleInput } from "../schemas/user.schema.js";

export const storeRefreshToken = async (
  userId: string,
  activeRole: string,
  refreshToken: string,
) => {
  await redisClient.set(
    `refresh_token:${userId}-${activeRole}`,
    refreshToken,
    "EX",
    7 * 24 * 60 * 60, //7days
  );
};

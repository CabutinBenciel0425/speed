import { redisClient } from "../lib/redis.js";

export const storeVerificationToken = async (
  email: string,
  verificationToken: string,
) => {
  await redisClient.set(
    `verificationToken:${email}`,
    verificationToken,
    "EX",
    24 * 60 * 60, //24hrs
  );
};

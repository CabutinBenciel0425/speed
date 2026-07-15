import { Redis } from "ioredis";
import { REDIS_URL } from "../config/envVars.js";

if (!REDIS_URL) {
  throw new Error("REDIS_URL is required in environment variables");
}

export const redisClient = new Redis(REDIS_URL);

redisClient.on("error", (err) => {
  console.error(`Redis error: ${err.message}`);
});

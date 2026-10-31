import { HOUR, ipKeyGenerator, rateLimit } from "express-rate-limit";
import { RedisStore, type RedisReply } from "rate-limit-redis";
import { redisClient } from "./redis.js";

export const limiter = rateLimit({
  windowMs: 1 * HOUR,
  limit: 5,
  keyGenerator: (req) => {
    const email = String(req.body?.email ?? "no-email")
      .trim()
      .toLowerCase();

    const ip = req.ip ? ipKeyGenerator(req.ip) : "unknown";

    return `${ip}-${email}`;
  },
  store: new RedisStore({
    sendCommand: async (...args: string[]): Promise<RedisReply> => {
      const [command, ...commandArgs] = args;

      if (!command) {
        throw new Error("Redis command is required");
      }

      return (await redisClient.call(command, ...commandArgs)) as RedisReply;
    },
  }),

  message: { error: "Too many requests, please try again later." },
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json(options.message);
  },
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

import dotenv from "dotenv";

dotenv.config();

export const {
  NODE_ENV,
  PORT,
  ACCESS_TOKEN_SECRET_KEY,
  REFRESH_TOKEN_SECRET_KEY,
  MONGODB_URI,
  REDIS_URL,
  PAYMONGO_SECRET_KEY,
  PAYMONGO_PUBLIC_KEY,
} = process.env;

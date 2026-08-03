import jwt from "jsonwebtoken";
import {
  ACCESS_TOKEN_SECRET_KEY,
  REFRESH_TOKEN_SECRET_KEY,
  TEMP_TOKEN_SECRET_KEY,
} from "../config/envVars.js";
import type { ValidUserRoleInput } from "../schemas/user.schema.js";

export const generateToken = (userId: string, activeRole: string) => {
  return {
    accessToken: createAccessToken(userId, activeRole),
    refreshToken: createRefreshToken(userId, activeRole),
  };
};

export const createAccessToken = (userId: string, activeRole: string) => {
  if (!ACCESS_TOKEN_SECRET_KEY)
    throw new Error(
      "ACCESS_TOKEN_SECRET_KEY is required in environment variables",
    );
  return jwt.sign({ userId, activeRole }, ACCESS_TOKEN_SECRET_KEY, {
    expiresIn: "15m",
  });
};

export const createRefreshToken = (userId: string, activeRole: string) => {
  if (!REFRESH_TOKEN_SECRET_KEY)
    throw new Error(
      "REFRESH_TOKEN_SECRET_KEY is required in environment variables",
    );
  return jwt.sign({ userId, activeRole }, REFRESH_TOKEN_SECRET_KEY, {
    expiresIn: "7d",
  });
};

export const createTempToken = (userId: string) => {
  if (!TEMP_TOKEN_SECRET_KEY)
    throw new Error(
      "TEMP_TOKEN_SECRET_KEY is required in environment variables",
    );
  return jwt.sign({ userId }, TEMP_TOKEN_SECRET_KEY, {
    expiresIn: "5m",
  });
};

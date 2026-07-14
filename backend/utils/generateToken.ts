import jwt from "jsonwebtoken";
import {
  ACCESS_TOKEN_SECRET_KEY,
  REFRESH_TOKEN_SECRET_KEY,
} from "../config/envVars.js";

export const generateToken = (userId: string) => {
  return {
    accessToken: createAccessToken(userId),
    refreshToken: createRefreshToken(userId),
  };
};

export const createAccessToken = (userId: string) => {
  if (!ACCESS_TOKEN_SECRET_KEY)
    throw new Error(
      "ACCESS_TOKEN_SECRET_KEY is required in environment variables",
    );
  return jwt.sign({ userId }, ACCESS_TOKEN_SECRET_KEY, {
    expiresIn: "15m",
  });
};

export const createRefreshToken = (userId: string) => {
  if (!REFRESH_TOKEN_SECRET_KEY)
    throw new Error(
      "REFRESH_TOKEN_SECRET_KEY is required in environment variables",
    );
  return jwt.sign({ userId }, REFRESH_TOKEN_SECRET_KEY, {
    expiresIn: "7d",
  });
};

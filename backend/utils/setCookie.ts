import { NODE_ENV } from "../config/envVars.js";
import { type Response } from "express";

const authCookieOptions = {
  httpOnly: true,
  secure: NODE_ENV === "production",
  // The Render frontend and API use different origins, so production auth
  // cookies must be sent with credentialed cross-origin requests.
  sameSite: (NODE_ENV === "production" ? "none" : "strict") as
    | "none"
    | "strict",
  path: "/",
};

export const setAccessToken = (res: Response, token: string) => {
  res.cookie("accessToken", token, {
    ...authCookieOptions,
    maxAge: 15 * 60 * 1000,
  });
};

export const setRefreshToken = (res: Response, token: string) => {
  res.cookie("refreshToken", token, {
    ...authCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const setTempToken = (res: Response, token: string) => {
  res.cookie("tempToken", token, {
    ...authCookieOptions,
    maxAge: 5 * 60 * 1000,
  });
};

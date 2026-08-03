import { NODE_ENV } from "../config/envVars.js";
import { type Response } from "express";

export const setAccessToken = (res: Response, token: string) => {
  res.cookie("accessToken", token, {
    httpOnly: true,
    secure: NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000,
    path: "/",
  });
};

export const setRefreshToken = (res: Response, token: string) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
};

export const setTempToken = (res: Response, token: string) => {
  res.cookie("tempToken", token, {
    httpOnly: true,
    secure: NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 5 * 60 * 1000,
    path: "/",
  });
};

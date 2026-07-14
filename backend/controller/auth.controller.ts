import {
  changeUserPassword,
  createCustomerUser,
  loginUser,
  logoutUser,
} from "../services/auth.service.js";
import { setAccessToken, setRefreshToken } from "../utils/setCookie.js";
import type { LoginInput, SignupInput } from "./../schemas/user.schema.js";
import { asyncHandler } from "./../utils/asyncHandler.js";
import type { Response, Request } from "express";
import { REFRESH_TOKEN_SECRET_KEY } from "../config/envVars.js";
import { redisClient } from "../lib/redis.js";

import User from "../models/user.model.js";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { createAccessToken } from "../utils/generateToken.js";
import { ApiError } from "../utils/apiError.js";
import { success } from "zod";

export const customerSignup = asyncHandler(
  async (req: Request, res: Response) => {
    // const role = Array.isArray(req.params.role)
    //   ? req.params.role[0]
    //   : req.params.role;

    const body: SignupInput = req.body;

    const { firstName, lastName, email, password, phoneNumber } = body;
    const newCustomer = await createCustomerUser({
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
    });

    res.status(201).json({
      success: true,
      message: "User successfully created",
      data: newCustomer,
    });
  },
);

export const login = asyncHandler(async (req: Request, res: Response) => {
  const body: LoginInput = req.body;

  const { email, password } = body;
  const { user, accessToken, refreshToken } = await loginUser({
    email,
    password,
  });

  setAccessToken(res, accessToken);
  setRefreshToken(res, refreshToken);

  res.status(200).json({
    success: true,
    message: "User successfully logged in",
    data: user,
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  await logoutUser(req);

  res.clearCookie("refreshToken");
  res.clearCookie("accessToken");

  res.status(200).json({
    success: true,
    message: "User successfully logged out",
  });
});

export const myProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;

  res.status(200).json({
    success: true,
    data: user,
  });
});

export const userProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.params.id;

  const user = await User.findById({ userId });

  res.status(200).json({
    success: true,
    data: user,
  });
});

export const recreateAccessToken = asyncHandler(
  async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new ApiError(409, "No refresh token provided.");
    }

    if (!REFRESH_TOKEN_SECRET_KEY) {
      throw new ApiError(
        409,
        "REFRESH_TOKEN_SECRET_KEY is required in environment variables",
      );
    }

    const decoded = jwt.verify(
      refreshToken,
      REFRESH_TOKEN_SECRET_KEY,
    ) as JwtPayload;

    const storedToken = await redisClient.get(
      `refresh_token:${decoded.userId}`,
    );

    if (!storedToken || storedToken !== refreshToken) {
      throw new ApiError(409, "Invalid refresh token");
    }

    const newAccessToken = createAccessToken(req.user._id);
    setAccessToken(res, newAccessToken);

    res.status(201).json({
      success: true,
      message: "Access token successfully refreshed",
    });
  },
);

export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const updatedUser = await changeUserPassword(email, password);

    res.status(200).json({
      success: true,
      message: "Password successfully updated",
      data: updatedUser,
    });
  },
);

export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const updatedUser = await changeUserPassword(email, password);

    res.status(200).json({
      success: false,
      message: "Password successfully updated",
      data: updatedUser,
    });
  },
);

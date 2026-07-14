import {
  changeUserPassword,
  createCustomerUser,
  loginUser,
  logoutUser,
  sendCodeFn,
  updateUser,
  verifyCode,
} from "../services/auth.service.js";
import { setAccessToken, setRefreshToken } from "../utils/setCookie.js";
import type { LoginInput, SignupInput } from "./../schemas/user.schema.js";
import { asyncHandler } from "./../utils/asyncHandler.js";
import type { Response, Request } from "express";
import { REFRESH_TOKEN_SECRET_KEY } from "../config/envVars.js";
import { redisClient } from "../lib/redis.js";
import { createAccessToken } from "../utils/generateToken.js";
import { ApiError } from "../utils/apiError.js";
import jwt, { type JwtPayload } from "jsonwebtoken";

import User from "../models/user.model.js";
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/errors.js";

export const customerSignup = asyncHandler(
  async (req: Request, res: Response) => {
    const body: SignupInput = req.body;

    const { firstName, lastName, email, password, phoneNumber } = body;

    const newCustomer = await createCustomerUser({
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      avatar: req.file,
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
    if (!req.user) {
      throw new UnauthorizedError("User not found");
    }
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

    const newAccessToken = createAccessToken(req.user._id.toString());
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

export const sendVerificationCode = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body ?? {};
    if (!email) {
      throw new ApiError(400, "Email is required");
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (user.isVerified) {
      throw new ConflictError("User is already verified");
    }

    await sendCodeFn(email);

    res.status(200).json({
      success: true,
      message: "Verification email sent",
    });
  },
);

export const codeVerification = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, code } = req.body ?? {};

    const updatedUser = await verifyCode(email, code);

    res.status(200).json({
      success: true,
      message: "Verification email sent",
      data: updatedUser,
    });
  },
);

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  const deletedUser = await User.findByIdAndDelete(id);

  if (!deletedUser) {
    throw new NotFoundError("User not found");
  }

  res.status(200).json({
    success: true,
    data: {
      deletedUser: {
        id: deletedUser._id,
        firstName: deletedUser.firstName,
        lastName: deletedUser.lastName,
        email: deletedUser.email,
        phoneNumber: deletedUser.phoneNumber,
        role: deletedUser.role,
        isVerified: deletedUser.isVerified,
      },
    },
  });
});

export const updateUserDetails = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new UnauthorizedError("Not authenticated");
    }

    const updatedUser = await updateUser(req.user, req.body);

    res.status(200).json({
      success: true,
    });
  },
);

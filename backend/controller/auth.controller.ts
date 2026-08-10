import {
  createCustomerUser,
  loginUser,
  logoutUser,
  sendCodeFn,
  updateCustomerUser,
  verifyCode,
  createMerchant,
  createDriver,
  resetUserPassword,
  requestPasswordReset,
  selectRoleService,
} from "../services/auth.service.js";
import {
  setAccessToken,
  setRefreshToken,
  setTempToken,
} from "../utils/setCookie.js";
import {
  selectRoleSchema,
  type LoginInput,
  type ResetPasswordInput,
  type SignupInput,
  type ValidUserRoleInput,
} from "./../schemas/user.schema.js";
import { asyncHandler } from "./../utils/asyncHandler.js";
import type { Response, Request } from "express";
import { REFRESH_TOKEN_SECRET_KEY } from "../config/envVars.js";
import { redisClient } from "../lib/redis.js";
import { createAccessToken } from "../utils/generateToken.js";
import { ApiError } from "../utils/apiError.js";
import { ConflictError, NotFoundError } from "../utils/errors.js";
import jwt, { type JwtPayload } from "jsonwebtoken";

import User from "../models/user.model.js";
import type { merchantInput } from "../schemas/merchant.schema.js";
import type { DriverInput } from "../schemas/driver.schema.js";

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

export const merchantSignup = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    const data: merchantInput = req.body;
    const files = req.files as {
      logo?: Express.Multer.File[];
      banner?: Express.Multer.File[];
    };

    if (!user) {
      throw new NotFoundError("User");
    }

    if (!user.isVerified) {
      throw new ConflictError("User email need to verify first.");
    }

    const { updatedUser, newMerchant } = await createMerchant(
      user?._id.toString(),
      {
        ...data,
        logo: files.logo?.[0],
        banner: files.banner?.[0],
      },
    );

    res.status(201).json({
      success: true,
      message: "Merchant account successfully created",
      data: { updatedUser, newMerchant },
    });
  },
);

export const driverSignup = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    const data: DriverInput = req.body;

    if (!user) {
      throw new NotFoundError("User");
    }

    if (!user.isVerified) {
      throw new ConflictError("User email need to verify first.");
    }

    const { updatedUser, newDriver } = await createDriver(
      user?._id.toString(),
      {
        ...data,
        avatar: req.file,
      },
    );

    res.status(201).json({
      success: true,
      message: "Driver account successfully created",
      data: { newDriver, updatedUser },
    });
  },
);

export const login = asyncHandler(async (req: Request, res: Response) => {
  const body: LoginInput = req.body;

  const { email, password } = body;
  const returnedData = await loginUser({
    email,
    password,
  });

  if (returnedData.accessToken && returnedData.refreshToken) {
    setAccessToken(res, returnedData.accessToken);
    setRefreshToken(res, returnedData.refreshToken);
  }

  if (returnedData.user) {
    return res.status(200).json({
      success: true,
      message: "User successfully logged in",
      data: returnedData.user,
    });
  }

  setTempToken(res, returnedData.tempToken);

  res.status(200).json({
    success: true,
    requiresRoleSelection: returnedData.requiresRoleSelection,
    roles: returnedData.roles,
  });
});

export const selectRole = asyncHandler(async (req: Request, res: Response) => {
  const activeRole: ValidUserRoleInput = req.body.activeRole;

  const { userDetails, accessToken, refreshToken } = await selectRoleService(
    activeRole,
    req,
  );

  setAccessToken(res, accessToken);
  setRefreshToken(res, refreshToken);
  res.clearCookie("tempToken");

  res.status(200).json({
    success: true,
    data: userDetails,
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
      `refresh_token:${decoded.userId}-${decoded.activeRole}`,
    );

    if (!storedToken || storedToken !== refreshToken) {
      throw new ApiError(409, "Invalid refresh token");
    }

    const newAccessToken = createAccessToken(
      decoded.userId,
      decoded.activeRole,
    );
    setAccessToken(res, newAccessToken);

    res.status(201).json({
      success: true,
      message: "Access token successfully refreshed",
    });
  },
);

export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) throw new NotFoundError("Required credentials");
    await requestPasswordReset(email);
    res.status(200).json({
      success: true,
      message:
        "If an account with that email exists, a reset code has been sent.",
    });
  },
);

export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, code, password }: ResetPasswordInput = req.body;

    const updatedUser = await resetUserPassword(email, code, password);

    res.status(200).json({
      success: true,
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
      throw new NotFoundError("User");
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

export const updateUserDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) {
      throw new NotFoundError("User");
    }
    const updatedCustomer = await updateCustomerUser(user, {
      ...req.body,
      avatar: req.file,
    });

    res.status(200).json({
      success: true,
      message: "User details successfully updated",
      data: updatedCustomer,
    });
  },
);

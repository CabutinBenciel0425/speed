import {
  changeUserPassword,
  createCustomerUser,
  loginUser,
  logoutUser,
  sendCodeFn,
  updateCustomerUser,
  verifyCode,
  createMerchant,
  createDriver,
} from "../services/auth.service.js";
import { setAccessToken, setRefreshToken } from "../utils/setCookie.js";
import type { LoginInput, SignupInput } from "./../schemas/user.schema.js";
import { asyncHandler } from "./../utils/asyncHandler.js";
import type { Response, Request } from "express";
import { REFRESH_TOKEN_SECRET_KEY } from "../config/envVars.js";
import { redisClient } from "../lib/redis.js";
import { createAccessToken } from "../utils/generateToken.js";
import { ApiError } from "../utils/apiError.js";
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/errors.js";
import jwt, { type JwtPayload } from "jsonwebtoken";

import User from "../models/user.model.js";
import type { merchantInput } from "../schemas/merchant.schema.js";
import type { DriverInput } from "../schemas/driver.schema.js";
import cloudinary from "../config/cloudinary.js";

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
      throw new NotFoundError("User not found");
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
      message: "Restaurant Owner successfully created",
      data: { updatedUser, newMerchant },
    });
  },
);

export const driverSignup = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    const data: DriverInput = req.body;

    if (!user) {
      throw new NotFoundError("User not found");
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
      message: "Restaurant Owner successfully created",
      data: { newDriver, updatedUser },
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
  console.log("\n" + "=".repeat(50));
  console.log("🔐🔐🔐 YOU HIT THE LOGIN ENDPOINT 🔐🔐🔐");
  console.log("=".repeat(50));
  console.log(`📧 Email: ${email}`);
  console.log(`⏰ Time: ${new Date().toISOString()}`);
  console.log("=".repeat(50) + "\n");
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

  const user = await User.findById(userId);

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
  const user = await User.findByIdAndDelete(id);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  if (user.avatar) {
    const publicId = user.avatar.split("/").pop()?.split(".")[0];
    if (publicId) {
      const deletedPublicId = await cloudinary.uploader.destroy(
        `productImages/${publicId}`,
      );

      if (!deletedPublicId) {
        throw new NotFoundError("Error in deleting image in cloudinary");
      }
    }
  }

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isVerified: user.isVerified,
      },
    },
  });
});

export const updateUserDetails = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new UnauthorizedError("Unauthorized access");
    }
    console.log(req.body);

    const updatedCustomer = await updateCustomerUser(req.user._id.toString(), {
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

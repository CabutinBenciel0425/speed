import { storeRefreshToken } from "./../utils/storeRefreshToken.js";
import { generateToken } from "./../utils/generateToken.js";
import type { LoginInput, SignupInput } from "./../schemas/user.schema.js";
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/errors.js";
import { REFRESH_TOKEN_SECRET_KEY } from "../config/envVars.js";
import { redisClient } from "../lib/redis.js";
import { type Request } from "express";

import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import type { IUser } from "../types/user.types.js";
import { ApiError } from "../utils/apiError.js";

export const createCustomerUser = async ({
  firstName,
  lastName,
  email,
  password,
  phoneNumber,
}: SignupInput) => {
  const existingCustomer = await User.findOne({ email });

  if (existingCustomer) {
    throw new ConflictError("User already exists");
  }

  const newCustomer = new User({
    firstName,
    lastName,
    email,
    password,
    phoneNumber,
    role: "Customer",
  });

  await newCustomer.save();

  return {
    newCustomer: {
      id: newCustomer._id,
      firstName: newCustomer.firstName,
      lastName: newCustomer.lastName,
      email: newCustomer.email,
      phoneNumber: newCustomer.phoneNumber,
      role: newCustomer.role,
    },
  };
};

export const loginUser = async ({ email, password }: LoginInput) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const { accessToken, refreshToken } = generateToken(user._id.toString());

  await storeRefreshToken(user._id.toString(), refreshToken);

  return {
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};

export const logoutUser = async (req: Request) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    if (!REFRESH_TOKEN_SECRET_KEY) {
      throw new Error(
        "REFRESH_TOKEN_SECRET_KEY is required in environment variables",
      );
    }
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET_KEY);
    console.log(decoded);
    await redisClient.del(`refresh_token:${decoded}`);
  }

  return true;
};

export const changeUserPassword = async (email: string, password: string) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  user.password = password;
  await user.save();

  return {
    updatedUser: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      isVerified: user.isVerified,
    },
  };
};

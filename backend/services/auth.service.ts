import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/errors.js";
import { storeRefreshToken } from "./../utils/storeRefreshToken.js";
import { generateToken } from "./../utils/generateToken.js";
import type { LoginInput, SignupInput } from "./../schemas/user.schema.js";
import {
  RANDOM_PROFILE_URL,
  REFRESH_TOKEN_SECRET_KEY,
} from "../config/envVars.js";
import { redisClient } from "../lib/redis.js";
import { type Request } from "express";
import { VERIFICATION_TOKEN_LENGTH } from "../config/constants.js";
import { generateVerificationToken } from "../utils/generateVerificationToken.js";
import { storeVerificationToken } from "../utils/storeVerificationToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import type { UserDocument } from "../types/user.types.js";
import { imageUpload } from "../utils/imageUpload.js";
import type { CreateCustomerInput } from "../types/types.js";

export const createCustomerUser = async ({
  firstName,
  lastName,
  email,
  password,
  phoneNumber,
  avatar,
}: CreateCustomerInput) => {
  const existingCustomer = await User.findOne({ email });

  if (existingCustomer) {
    throw new ConflictError("User already exists");
  }

  let cloudinaryImageUrl = "";

  if (avatar) {
    cloudinaryImageUrl = await imageUpload(avatar);
  }

  const newCustomer = new User({
    firstName,
    lastName,
    email,
    password,
    phoneNumber,
    role: "Customer",
    avatar:
      cloudinaryImageUrl ||
      `${RANDOM_PROFILE_URL}name=${encodeURIComponent(firstName + lastName)}&size=128&background=random&color=fff&bold=true`,
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
      isVerified: user.isVerified,
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

export const sendCodeFn = async (email: string) => {
  const token = generateVerificationToken(VERIFICATION_TOKEN_LENGTH);
  await storeVerificationToken(email, token);

  const sentEmailInfo = await sendEmail(email, token);

  return sentEmailInfo;
};

export const verifyCode = async (email: string, code: string) => {
  const storedCode = await redisClient.get(`verificationToken:${email}`);

  if (!storedCode) {
    throw new NotFoundError("Code is not recognized");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  if (user.isVerified) {
    throw new ConflictError("User is already verified");
  }

  user.isVerified = true;
  user.save();

  return {
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      isVerified: user.isVerified,
    },
  };
};

interface updateData {
  firstName: String;
  lastName: String;
  phoneNumber: String;
  avatar: String;
}

export const updateUser = async (
  user: UserDocument,
  { firstName, lastName, phoneNumber, avatar }: updateData,
) => {};

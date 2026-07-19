import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/errors.js";
import { storeRefreshToken } from "./../utils/storeRefreshToken.js";
import { generateToken } from "./../utils/generateToken.js";
import type { LoginInput } from "./../schemas/user.schema.js";
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
import jwt, { type JwtPayload } from "jsonwebtoken";
import User from "../models/user.model.js";
import type { IUser } from "../types/user.types.js";
import type {
  CreateCustomerInput,
  CreateDriverInput,
  CreateMerchantInput,
  UpdateCustomerInput,
} from "../types/types.js";
import Merchant from "../models/merchant.model.js";
import { imageUpload } from "../utils/imageUpload.js";
import Driver from "../models/driver.model.js";
import { addUserRole } from "../utils/addRole.js";
import cloudinary from "../config/cloudinary.js";

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
    cloudinaryImageUrl = await imageUpload(avatar, "customer");
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

export const createMerchant = async (
  userId: string,
  data: CreateMerchantInput,
) => {
  const logoUrl = data.logo
    ? await imageUpload(data.logo, `merchant/logo`)
    : undefined;

  const bannerUrl = data.banner
    ? await imageUpload(data.banner, `merchant/banner`)
    : undefined;

  const newMerchant = new Merchant({
    owner: userId,
    merchantName: data.merchantName,
    description: data.description ?? null,
    phoneNumber: data.phoneNumber,
    logo: logoUrl,
    banner: bannerUrl,
    address: data.address,
    operatingHours: data.operatingHours,
    deliveryFee: data.deliveryFee,
    minimumOrder: data.minimumOrder,
  });

  await newMerchant.save();

  const updatedUser = await addUserRole(userId, "Merchant");

  return {
    newMerchant: {
      owner: userId,
      merchantName: data.merchantName,
      description: data.description ?? null,
      phoneNumber: data.phoneNumber,
      address: data.address,
      operatingHours: data.operatingHours,
      deliveryFee: data.deliveryFee,
      minimumOrder: data.minimumOrder,
    },
    updatedUser,
  };
};

export const createDriver = async (userId: string, data: CreateDriverInput) => {
  let cloudinaryImageUrl = "";

  if (data.avatar) {
    cloudinaryImageUrl = await imageUpload(data.avatar, "customer");
  }

  const newDriver = new Driver({
    user: userId,
    vehicleType: data.vehicleType,
    plateNumber: data.plateNumber,
    avatar:
      cloudinaryImageUrl ||
      "https://res.cloudinary.com/dwqlvkvup/image/upload/v1784193492/default-avatar_mxorjt.jpg",
  });

  await newDriver.save();

  const updatedUser = await addUserRole(userId, "Driver");

  console.log(updatedUser);

  return {
    newDriver: {
      user: userId,
      vehicleType: newDriver.vehicleType,
      plateNumber: newDriver.plateNumber,
    },
    updatedUser,
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
    const decoded = jwt.verify(
      refreshToken,
      REFRESH_TOKEN_SECRET_KEY,
    ) as JwtPayload;
    await redisClient.del(`refresh_token:${decoded.userId}`);
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
    throw new ConflictError("Wrong code");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  if (user.isVerified) {
    throw new ConflictError("User is already verified");
  }

  if (code !== storedCode) {
    throw new ConflictError("Code is not recognized");
  }

  user.isVerified = true;
  await user.save();

  const exists = await redisClient.exists(`verificationToken:${email}`);
  if (exists) {
    await redisClient.del(`verificationToken:${email}`);
    console.log(`✅ Verification token for ${email} deleted`);
  } else {
    console.log(`⚠️ No verification token found for ${email}`);
  }

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

export const updateCustomerUser = async (
  userId: string,
  { firstName, lastName, email, phoneNumber, avatar }: UpdateCustomerInput,
) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  const updateData: Partial<IUser> = {};

  if (firstName !== undefined) {
    updateData.firstName = firstName;
  }

  if (lastName !== undefined) {
    updateData.lastName = lastName;
  }

  if (phoneNumber !== undefined) {
    updateData.phoneNumber = phoneNumber;
  }

  if (email !== undefined && email !== user.email) {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new ConflictError("Email already exists");
    }

    updateData.email = email;
    updateData.isVerified = false;
  }

  if (avatar) {
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
    const cloudinaryImageUrl = await imageUpload(avatar, "customer");

    updateData.avatar = cloudinaryImageUrl;
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $set: updateData,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedUser) {
    throw new ConflictError(
      "Cannot update the details. Please try again later",
    );
  }

  return {
    user: {
      id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      phoneNumber: updatedUser.phoneNumber,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
      isVerified: updatedUser.isVerified,
    },
  };
};

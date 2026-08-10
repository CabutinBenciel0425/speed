import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/errors.js";
import { storeRefreshToken } from "./../utils/storeRefreshToken.js";
import { createTempToken, generateToken } from "./../utils/generateToken.js";
import type {
  LoginInput,
  ValidUserRoleInput,
} from "./../schemas/user.schema.js";
import {
  RANDOM_PROFILE_URL,
  REFRESH_TOKEN_SECRET_KEY,
  TEMP_TOKEN_SECRET_KEY,
} from "../config/envVars.js";
import { redisClient } from "../lib/redis.js";
import { type Request } from "express";
import {
  DEFAULT_DRIVER_AVATAR,
  VERIFICATION_TOKEN_LENGTH,
} from "../config/constants.js";
import { generateVerificationToken } from "../utils/generateVerificationToken.js";
import { storeVerificationToken } from "../utils/storeVerificationToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import jwt, { type JwtPayload } from "jsonwebtoken";
import User, { type IUser } from "../models/user.model.js";
import type {
  CreateCustomerInput,
  CreateDriverInput,
  CreateMerchantInput,
  UpdateCustomerInput,
} from "../types/types.js";
import Merchant, { type IMerchant } from "../models/merchant.model.js";
import { imageUpload } from "../utils/imageUpload.js";
import Driver, { type IDriver } from "../models/driver.model.js";
import { addUserRole } from "../utils/addRole.js";
import cloudinary from "../config/cloudinary.js";
import { storePasswordResetToken } from "../utils/storePasswordResetToken.js";
import type { HydratedDocument } from "mongoose";
import { extractPublicIdFromUrl } from "../utils/extractPublicIdFromUrl.js";

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
  const user: HydratedDocument<IUser> | null = await User.findOne({ email });

  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new UnauthorizedError("Invalid email or password");
  }

  if (user.role.length > 1) {
    const tempToken = createTempToken(user._id.toString());
    return {
      tempToken,
      requiresRoleSelection: true,
      roles: user.role,
    };
  }

  const activeRole: ValidUserRoleInput = "Customer";

  const { accessToken, refreshToken } = generateToken(
    user._id.toString(),
    activeRole,
  );

  await storeRefreshToken(user._id.toString(), activeRole, refreshToken);

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

type UserDetailsType = IDriver | IMerchant | IUser;

export const selectRoleService = async (
  activeRole: ValidUserRoleInput,
  req: Request,
) => {
  const tempToken = req.cookies.tempToken;

  if (!tempToken) {
    throw new UnauthorizedError("Unauthorized user");
  }

  if (!TEMP_TOKEN_SECRET_KEY) {
    throw new Error(
      "TEMP_TOKEN_SECRET_KEY is required in environment variables",
    );
  }
  const decoded = jwt.verify(tempToken, TEMP_TOKEN_SECRET_KEY) as JwtPayload;

  const user = await User.findById(decoded.userId);

  if (!user) {
    throw new NotFoundError("User");
  }

  if (!user.role.includes(activeRole)) {
    throw new UnauthorizedError(
      "Provided role not found in the user's listed role",
    );
  }

  let userDetails: UserDetailsType | null = null;

  if (activeRole === "Customer" || activeRole === "Admin") {
    userDetails = user;
  }

  if (activeRole === "Merchant") {
    const merchant = (await Merchant.findOne({ owner: user._id })) as IMerchant;
    if (!merchant) {
      throw new NotFoundError("Merchant");
    }
    userDetails = merchant;
  }

  if (activeRole === "Driver") {
    const driver = (await Driver.findOne({ user: user._id })) as IDriver;
    if (!driver) {
      throw new NotFoundError("Driver");
    }
    userDetails = driver;
  }

  if (!userDetails) {
    throw new NotFoundError(activeRole);
  }

  const { accessToken, refreshToken } = generateToken(
    user._id.toString(),
    activeRole,
  );

  await storeRefreshToken(user._id.toString(), activeRole, refreshToken);

  return {
    userDetails,
    accessToken,
    refreshToken,
  };
};

export const logoutUser = async (req: Request) => {
  const refreshToken = req.cookies.refreshToken;
  const userRole = req.userRole;

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
    await redisClient.del(`refresh_token:${decoded.userId}-${userRole}`);
  }

  return true;
};

export const requestPasswordReset = async (email: string) => {
  const user = await User.findOne({ email });

  if (!user) return;

  const resetToken = generateVerificationToken(VERIFICATION_TOKEN_LENGTH);
  await storePasswordResetToken(email, resetToken);
  await sendEmail(email, resetToken);
};

export const resetUserPassword = async (
  email: string,
  code: string,
  password: string,
) => {
  const storedCode = await redisClient.get(`passwordReset:${email}`);

  if (!storedCode || storedCode !== code) {
    throw new UnauthorizedError("Invalid or expired reset code");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new NotFoundError("User");
  }

  user.password = password;
  await user.save();

  await redisClient.del(`passwordReset:${email}`);
  await redisClient.del(`refresh_token:${user._id.toString()}`);

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
    throw new NotFoundError("User");
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
  user: HydratedDocument<IUser>,
  { firstName, lastName, email, phoneNumber, avatar }: UpdateCustomerInput,
) => {
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
    if (user.avatar && user.avatar !== DEFAULT_DRIVER_AVATAR) {
      const publicId = extractPublicIdFromUrl(user.avatar);

      if (publicId) {
        const result = await cloudinary.uploader.destroy(publicId);
        if (result.result !== "ok") {
          console.warn(
            `Cloudinary cleanup failed for ${publicId}: ${result.result}`,
          );
        }
      }
    }
    const cloudinaryImageUrl = await imageUpload(avatar, "customer");

    updateData.avatar = cloudinaryImageUrl;
  }

  const updatedUser = await User.findByIdAndUpdate(
    user._id,
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

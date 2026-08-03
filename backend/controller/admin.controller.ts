import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import { NotFoundError, UnauthorizedError } from "../utils/errors.js";
import { DEFAULT_DRIVER_AVATAR } from "../config/constants.js";
import { extractPublicIdFromUrl } from "../utils/extractPublicIdFromUrl.js";
import cloudinary from "../config/cloudinary.js";
import { buildQuery } from "../utils/buildQuery.js";
import Merchant from "../models/merchant.model.js";
import Driver from "../models/driver.model.js";

export const userProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.params.id;

  const user = await User.findById(userId).select("-password");

  res.status(200).json({
    success: true,
    data: user,
  });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  const user = await User.findById(id);

  if (!user) {
    throw new NotFoundError("User");
  }

  if (!user.role.includes("Admin")) {
    throw new UnauthorizedError("Unauthorized user");
  }

  user.isDeleted = true;

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

export const allUsers = asyncHandler(async (req: Request, res: Response) => {
  const queryData = buildQuery(req.query);

  const allowedSorts = ["createdAt", "-createdAt"];

  const sort = allowedSorts.includes(queryData.sort)
    ? queryData.sort
    : "-createdAt";

  if (queryData.search) {
    queryData.filter.$or = [
      {
        firstName: {
          $regex: queryData.search,
          $options: "i",
        },
      },
      {
        lastName: {
          $regex: queryData.search,
          $options: "i",
        },
      },
      {
        email: {
          $regex: queryData.search,
          $options: "i",
        },
      },
      {
        role: {
          $regex: queryData.search,
          $options: "i",
        },
      },
    ];
  }

  const docs = await User.find(queryData.filter)
    .select("-password")
    .sort(sort)
    .select(queryData.select)
    .skip(queryData.skip)
    .limit(queryData.limit);

  const total = await User.countDocuments(queryData.filter);

  console.log(docs);

  res.json({
    success: true,
    data: docs,
    pagination: {
      total,
      page: queryData.page,
      limit: queryData.limit,
      pages: Math.ceil(total / queryData.limit),
    },
  });
});

export const merchantProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const merchantId = req.params.merchantId;

    const merchant = await Merchant.findById(merchantId).populate("owner");

    res.status(200).json({
      success: true,
      data: merchant,
    });
  },
);

type MerchantStatusType =
  | "Approved"
  | "Closed"
  | "Open"
  | "Pending"
  | "Rejected"
  | "Suspended";

export const toggleMerchantStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    const status = req.params.status as MerchantStatusType;
    const merchantId = req.params.merchantId;
    const merchant = await Merchant.findById(merchantId);

    if (!merchant) {
      throw new NotFoundError("User");
    }

    if (!user) {
      throw new UnauthorizedError("Unauthorized user");
    }

    if (!user.role.includes("Admin")) {
      throw new UnauthorizedError("Unauthorized user");
    }

    merchant.status = status;

    res.status(200).json({
      success: true,
      data: merchant,
    });
  },
);

export const allMerchants = asyncHandler(
  async (req: Request, res: Response) => {
    const queryData = buildQuery(req.query);

    const allowedSorts = [
      "merchantName",
      "-merchantName",
      "status",
      "-status",
      "ratingCount",
      "-ratingCount",
      "averageRating",
      "-averageRating",
    ];

    const sort = allowedSorts.includes(queryData.sort)
      ? queryData.sort
      : "-merchantName";

    if (queryData.search) {
      queryData.filter.$or = [
        {
          merchantName: {
            $regex: queryData.search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: queryData.search,
            $options: "i",
          },
        },
      ];
    }

    const docs = await Merchant.find(queryData.filter)
      .sort(sort)
      .select(queryData.select)
      .skip(queryData.skip)
      .limit(queryData.limit);

    const total = await Merchant.countDocuments(queryData.filter);

    res.json({
      success: true,
      data: docs,
      pagination: {
        total,
        page: queryData.page,
        limit: queryData.limit,
        pages: Math.ceil(total / queryData.limit),
      },
    });
  },
);

export const driverProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const driverId = req.params.id;

    const merchant = await Merchant.findById(driverId).populate("user");

    res.status(200).json({
      success: true,
      data: merchant,
    });
  },
);

type DriverStatusType = "Pending" | "Operational" | "Suspended";

export const toggleDriverStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    const status = req.params.status as DriverStatusType;
    const driverId = req.params.driverId;
    const driver = await Driver.findById(driverId);

    if (!driver) {
      throw new NotFoundError("User");
    }

    if (!user) {
      throw new UnauthorizedError("Unauthorized user");
    }

    if (!user.role.includes("Admin")) {
      throw new UnauthorizedError("Unauthorized user");
    }

    driver.status = status;

    res.status(200).json({
      success: true,
      data: driver,
    });
  },
);

export const allDrivers = asyncHandler(async (req: Request, res: Response) => {
  const queryData = buildQuery(req.query);

  const allowedSorts = [
    "vehicleType",
    "-vehicleType",
    "status",
    "-status",
    "workingStatus",
    "-workingStatus",
    "ratingCount",
    "-ratingCount",
    "averageRating",
    "-averageRating",
  ];

  const sort = allowedSorts.includes(queryData.sort)
    ? queryData.sort
    : "-status";

  if (queryData.search) {
    queryData.filter.$or = [
      {
        vehicleType: {
          $regex: queryData.search,
          $options: "i",
        },
      },
      {
        plateNumber: {
          $regex: queryData.search,
          $options: "i",
        },
      },
      {
        status: {
          $regex: queryData.search,
          $options: "i",
        },
      },
    ];
  }

  const docs = await Driver.find(queryData.filter)
    .sort(sort)
    .select(queryData.select)
    .skip(queryData.skip)
    .limit(queryData.limit);

  const total = await Driver.countDocuments(queryData.filter);

  res.json({
    success: true,
    data: docs,
    pagination: {
      total,
      page: queryData.page,
      limit: queryData.limit,
      pages: Math.ceil(total / queryData.limit),
    },
  });
});

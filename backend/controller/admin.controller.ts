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
import Order from "../models/order.model.js";
import {
  cancelOrderService,
  getOrderAnalyticsService,
  getRevenueAnalyticsService,
} from "../services/admin.service.js";
import Product from "../models/product.model.js";
import Review from "../models/review.model.js";
import { ApiError } from "../utils/apiError.js";
import Category from "../models/category.model.js";

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
    const driverId = req.params.driverId;

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

export const allOrders = asyncHandler(async (req: Request, res: Response) => {
  const queryData = buildQuery(req.query);

  const allowedSorts = [
    "status",
    "-status",
    "orderNumber",
    "-orderNumber",
    "createdAt",
    "-createdAt",
    "pricing.total",
    "-pricing.total",
    "deliveryAddress.city",
    "-deliveryAddress.city",
  ];

  const sort = allowedSorts.includes(queryData.sort)
    ? queryData.sort
    : "-createdAt";

  if (queryData.search) {
    queryData.filter.$or = [
      {
        orderNumber: {
          $regex: queryData.search,
          $options: "i",
        },
      },
      {
        "items.productName": {
          $regex: queryData.search,
          $options: "i",
        },
      },
      {
        "deliveryAddress.street": {
          $regex: queryData.search,
          $options: "i",
        },
      },
      {
        "deliveryAddress.barangay": {
          $regex: queryData.search,
          $options: "i",
        },
      },
      {
        "deliveryAddress.city": {
          $regex: queryData.search,
          $options: "i",
        },
      },
      {
        "deliveryAddress.province": {
          $regex: queryData.search,
          $options: "i",
        },
      },
      {
        "payment.method": {
          $regex: queryData.search,
          $options: "i",
        },
      },
      {
        "payment.status": {
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

  const docs = await Order.find(queryData.filter)
    .sort(sort)
    .select(queryData.select)
    .skip(queryData.skip)
    .limit(queryData.limit);

  const total = await Order.countDocuments(queryData.filter);

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

export const orderDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const orderId = req.params.orderId;

    const order = await Order.findById(orderId).populate(
      "user merchant driver",
    );

    res.status(200).json({
      success: true,
      data: order,
    });
  },
);

export const cancelOrder = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const orderId = req.params.orderId as string;

  if (!user) {
    throw new UnauthorizedError("Unauthorized user");
  }

  const order = await cancelOrderService(user, orderId);

  res.status(200).json({
    success: true,
    data: order,
  });
});

export const allProducts = asyncHandler(async (req: Request, res: Response) => {
  const queryData = buildQuery(req.query);

  const allowedSorts = [
    "name",
    "-name",
    "price",
    "-price",
    "createdAt",
    "-createdAt",
    "totalSold",
    "-totalSold",
  ];

  const sort = allowedSorts.includes(queryData.sort)
    ? queryData.sort
    : "-createdAt";

  if (queryData.search) {
    queryData.filter.$or = [
      {
        name: {
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
      {
        ingredients: {
          $regex: queryData.search,
          $options: "i",
        },
      },
      {
        tags: {
          $regex: queryData.search,
          $options: "i",
        },
      },
    ];
  }

  const docs = await Product.find(queryData.filter)
    .sort(sort)
    .select(queryData.select)
    .skip(queryData.skip)
    .limit(queryData.limit);

  const total = await Product.countDocuments(queryData.filter);

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

export const allReviews = asyncHandler(async (req: Request, res: Response) => {
  const queryData = buildQuery(req.query);

  const allowedSorts = [
    "rating",
    "-rating",
    "createdAt",
    "-createdAt",
    "isHidden",
    "-isHidden",
  ];

  const sort = allowedSorts.includes(queryData.sort)
    ? queryData.sort
    : "-createdAt";

  if (queryData.search) {
    queryData.filter.$or = [
      {
        targetType: {
          $regex: queryData.search,
          $options: "i",
        },
      },
      {
        rating: {
          $regex: queryData.search,
          $options: "i",
        },
      },
      {
        comment: {
          $regex: queryData.search,
          $options: "i",
        },
      },
    ];
  }

  const docs = await Review.find(queryData.filter)
    .sort(sort)
    .select(queryData.select)
    .skip(queryData.skip)
    .limit(queryData.limit);

  const total = await Review.countDocuments(queryData.filter);

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

export const reviewDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const reviewId = req.params.reviewId;

    const review = await Order.findById(reviewId).populate(
      "order reviewer reviewee",
    );

    res.status(200).json({
      success: true,
      data: review,
    });
  },
);

export const hideReview = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const reviewId = req.params.reviewId;

  if (user?.role.includes("Admin")) {
    throw new UnauthorizedError("Unauthorized user");
  }

  const review = await Order.findByIdAndUpdate(reviewId, { isHidden: true });

  if (!review) {
    throw new NotFoundError("Order");
  }

  res.status(200).json({
    success: true,
    message: "Review successfully hidden",
    data: review,
  });
});

export const getDashboardSummary = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;

    if (!user || !user.role.includes("Admin")) {
      throw new UnauthorizedError("Unauthorized user");
    }

    const totalCustomer = await User.countDocuments({});
    const totalMerchants = await Merchant.countDocuments({});
    const totalDrivers = await Driver.countDocuments({});

    const totalOrders = await Order.countDocuments({});
    const pendingOrders = await Order.countDocuments({ status: "Pending" });
    const completedOrders = await Order.countDocuments({ status: "Delivered" });
    const cancelledOrders = await Order.countDocuments({ status: "Cancelled" });

    const totalProducts = await Product.countDocuments({});
    const totalCategories = await Category.countDocuments({});

    //{ _id: null, totalRevenue: 4250.50, totalDeliveryFees: 150.00 }
    const totalRevenue = Order.aggregate([
      {
        $match: {
          status: "Delivered",
          "payment.status": "Paid",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$pricing.subtotal" },
          totalDeliveryFee: { $sum: "$pricing.deliveryFee" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalCustomer,
        totalMerchants,
        totalDrivers,
        totalOrders,
        pendingOrders,
        completedOrders,
        cancelledOrders,
        totalProducts,
        totalCategories,
        totalRevenue,
      },
    });
  },
);

export type PeriodType = "hour" | "day" | "week" | "month";

export const getRevenueAnalytics = asyncHandler(
  async (req: Request, res: Response) => {
    const period = req.params.period as PeriodType;

    const revenue = await getRevenueAnalyticsService(period);

    res.status(200).json({ success: true, data: revenue });
  },
);

export const getOrderAnalytics = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;

    if (!user) {
      throw new UnauthorizedError("Unauthorized user");
    }

    const orderAnalytics = await getOrderAnalyticsService(user);

    res.status(200).json({ success: true, data: orderAnalytics });
  },
);

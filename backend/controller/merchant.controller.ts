import mongoose, { type QueryFilter, Types } from "mongoose";
import Merchant, { type IMerchant } from "../models/merchant.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import type { Request, Response } from "express";
import { buildQuery } from "../utils/buildQuery.js";
import { NotFoundError, UnauthorizedError } from "../utils/errors.js";
import { ApiError } from "../utils/apiError.js";
import {
  getMerchantFavoritesService,
  getMerchantAnalyticsService,
  getMerchantDashboardService,
  getMerchantProductsService,
  getMerchantsService,
  merchantAcceptOrder,
  merchantCancelOrder,
  merchantReadyOrder,
  merchantRejectOrder,
  toggleMerchantFavoriteService,
  updateMerchantProfileService,
  merchantPickedupOrder,
} from "../services/merchant.service.js";
import type { merchantUpdateInput } from "../schemas/merchant.schema.js";
import MerchantFavorite from "../models/merchantFavorite.model.js";
import Order from "../models/order.model.js";
import { userInfo } from "node:os";
import Address from "../models/address.model.js";

const requireOwnedMerchant = async (userId: string, merchantId: string) => {
  const merchant = await Merchant.findOne({ _id: merchantId, owner: userId });
  if (!merchant) throw new NotFoundError("Merchant");
  return merchant;
};

export const getMyMerchant = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError("Unauthorized user");
    const merchant = await Merchant.findOne({ owner: req.user._id });
    if (!merchant) throw new NotFoundError("Merchant");
    console.log("MY MERCHANT", merchant);
    res.status(200).json({ success: true, data: merchant });
  },
);

export const getMerchantAnalytics = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError("Unauthorized user");
    const period = req.query.period ?? "30d";
    if (period !== "7d" && period !== "30d" && period !== "90d") {
      throw new ApiError(400, "Period must be 7d, 30d, or 90d");
    }
    const data = await getMerchantAnalyticsService(
      req.user._id.toString(),
      period,
    );
    res.status(200).json({ success: true, data });
  },
);

export const getMerchantDashboard = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError("Unauthorized user");
    const data = await getMerchantDashboardService(req.user._id.toString());
    res.status(200).json({ success: true, data });
  },
);

export const getOrders = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const merchantId = req.params.merchantId as string;

  if (!user) throw new UnauthorizedError("Unauthorized user");
  if (!merchantId) {
    throw new NotFoundError("Merchant id");
  }

  await requireOwnedMerchant(user._id.toString(), merchantId);
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
  const filter = { merchant: merchantId };
  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("customer", "firstName lastName phoneNumber")
      .populate("driver", "workingStatus")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: orders,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  });
});

export const acceptOrder = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const merchantId = req.params.merchantId as string;
  const orderId = req.params.orderId as string;

  if (!merchantId) {
    throw new NotFoundError("Merchant id");
  }

  if (!orderId) {
    throw new NotFoundError("Order id");
  }

  if (!user) throw new UnauthorizedError("Unauthorized user");
  await requireOwnedMerchant(user._id.toString(), merchantId);
  const order = await merchantAcceptOrder(orderId, merchantId);

  const orders = await Order.find({ merchant: merchantId });

  res.status(200).json({
    success: true,
    data: order,
  });
});

export const rejectOrder = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const merchantId = req.params.merchantId as string;
  const orderId = req.params.orderId as string;

  if (!merchantId) {
    throw new NotFoundError("Merchant id");
  }

  if (!orderId) {
    throw new NotFoundError("Order id");
  }

  if (!user) throw new UnauthorizedError("Unauthorized user");
  await requireOwnedMerchant(user._id.toString(), merchantId);
  const order = await merchantRejectOrder(orderId, merchantId);

  res.status(200).json({
    success: true,
    data: order,
  });
});

export const readyOrder = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const merchantId = req.params.merchantId as string;
  const orderId = req.params.orderId as string;
  // const { paymentCost } = req.body;

  if (!merchantId) {
    throw new NotFoundError("Merchant id");
  }

  if (!orderId) {
    throw new NotFoundError("Order id");
  }

  if (!user) throw new UnauthorizedError("Unauthorized user");
  await requireOwnedMerchant(user._id.toString(), merchantId);
  const order = await merchantReadyOrder(orderId, merchantId);

  res.status(200).json({
    success: true,
    data: order,
  });
});

export const pickedupOrder = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    const merchantId = req.params.merchantId as string;
    const orderId = req.params.orderId as string;

    if (!merchantId) {
      throw new NotFoundError("Merchant id");
    }

    if (!orderId) {
      throw new NotFoundError("Order id");
    }

    if (!user) throw new UnauthorizedError("Unauthorized user");
    await requireOwnedMerchant(user._id.toString(), merchantId);
    const order = await merchantPickedupOrder(orderId, merchantId);

    res.status(200).json({
      success: true,
      data: order,
    });
  },
);

export const cancelMerchantOrder = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    const merchantId = req.params.merchantId as string;
    const orderId = req.params.orderId as string;
    const cancellationReason =
      typeof req.body?.cancellationReason === "string"
        ? req.body.cancellationReason
        : "Cancelled by merchant";

    if (!user) throw new UnauthorizedError("Unauthorized user");
    await requireOwnedMerchant(user._id.toString(), merchantId);
    const order = await merchantCancelOrder(
      orderId,
      merchantId,
      cancellationReason,
    );
    res.status(200).json({ success: true, data: order });
  },
);

export const getMerchants = asyncHandler(
  async (req: Request, res: Response) => {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid coordinates: latitude must be between -90 and 90, longitude between -180 and 180",
      });
    }

    let coordinates = null;

    if (!isNaN(lat) && !isNaN(lng)) {
      coordinates = { lng, lat };
    }

    const { limitedDocs, total, queryData } = await getMerchantsService(
      req.query,
      coordinates,
    );

    res.status(200).json({
      success: true,
      data: limitedDocs,
      pagination: {
        total,
        page: queryData.page,
        limit: queryData.limit,
        pages: Math.ceil(total / queryData.limit),
      },
    });
  },
);

export const getMerchantDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const merchantId = req.params.merchantId;

    if (!merchantId) {
      throw new NotFoundError("Merchant id");
    }

    const merchant = await Merchant.findById(merchantId).populate("owner");

    if (!merchant) {
      throw new NotFoundError("Merchant");
    }

    res.status(200).json({
      success: true,
      data: {
        _id: merchant._id,
        merchantName: merchant.merchantName,
        description: merchant.description || null,
        logo: merchant.logo || null,
        banner: merchant.banner || null,
        address: merchant.address,
        operatingHours: merchant.operatingHours,
        ratingCount: merchant.ratingCount,
        averageRating: merchant.averageRating,
        isOpen: merchant.isOpen,
      },
    });
  },
);

export type RequestType = "public" | "merchant";

export const getMerchantProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const merchantId = req.params.merchantId as string;
    const requestType = req.params.requestType as RequestType;
    let user = null;

    if (req.user) {
      user = req.user;
    }

    if (!merchantId) {
      throw new NotFoundError("Merchant Id");
    }

    const { docs, merchant, total, queryData } =
      await getMerchantProductsService(
        req.query,
        merchantId,
        requestType,
        user?._id.toString(),
      );

    res.status(200).json({
      success: true,
      data: {
        merchant,
        products: docs,
      },
      pagination: {
        total,
        page: queryData.page,
        limit: queryData.limit,
        pages: Math.ceil(total / queryData.limit),
      },
    });
  },
);

export const getMerchantProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    const merchantId = req.params.merchantId;

    if (!user) {
      throw new UnauthorizedError("Unauthorized user");
    }

    const merchant = await Merchant.findOne({
      owner: user._id,
      _id: merchantId,
    } as QueryFilter<IMerchant>).populate("owner");

    if (!merchant) {
      throw new NotFoundError("Merchant");
    }

    res.status(200).json({
      success: true,
      data: merchant,
    });
  },
);

export const updateMerchantProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    const merchantId = req.params.merchantId as string;
    const payload: merchantUpdateInput = req.body;
    const files = (req.files ?? {}) as {
      logo?: Express.Multer.File[];
      banner?: Express.Multer.File[];
    };
    const logo = files.logo?.[0];
    const banner = files.banner?.[0];

    if (!user) {
      throw new UnauthorizedError("Unauthorized user");
    }
    const updatedMerchant = await updateMerchantProfileService(
      user.id.toString(),
      merchantId,
      payload,
      logo,
      banner,
    );

    res.status(200).json({
      success: true,
      data: updatedMerchant,
    });
  },
);

export const toggleMerchantFavorite = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    const merchantId = req.params.merchantId as string;

    if (!user) {
      throw new UnauthorizedError("User not authenticated");
    }

    if (!merchantId) {
      throw new NotFoundError("Merchant id");
    }

    const { isFavorite } = await toggleMerchantFavoriteService(
      user,
      merchantId,
    );

    res.status(200).json({
      success: true,
      isFavorite,
    });
  },
);

export const getMerchantFavorites = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);

    if (!user) {
      throw new UnauthorizedError("User not authorized");
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid coordinates: latitude must be between -90 and 90, longitude between -180 and 180",
      });
    }

    let coordinates = null;

    if (!isNaN(lat) && !isNaN(lng)) {
      coordinates = { lng, lat };
    }

    const { docs, total, queryData } = await getMerchantFavoritesService(
      req.query,
      user._id.toString(),
      coordinates,
    );

    res.status(200).json({
      success: true,
      data: {
        merchants: docs,
        pagination: {
          total,
          page: queryData.page,
          limit: queryData.limit,
          pages: Math.ceil(total / queryData.limit),
        },
      },
    });
  },
);

export const getMerchantFavoriteStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    const merchantId = req.params.merchantId as string;

    if (!user) {
      throw new UnauthorizedError("User not authorized");
    }

    const merchantFavoriteStatus = await MerchantFavorite.findOne({
      user: user._id,
      merchant: merchantId,
    });

    res.status(200).json({
      success: true,
      data: {
        isFavorite: !!merchantFavoriteStatus,
      },
    });
  },
);

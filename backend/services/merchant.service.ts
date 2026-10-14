import mongoose from "mongoose";
import Order, { type IOrder } from "../models/order.model.js";
import { ConflictError, NotFoundError } from "../utils/errors.js";
import Merchant, { type IMerchant } from "../models/merchant.model.js";
import Driver from "../models/driver.model.js";
import { io } from "../server.js";
import User, { type IUser } from "../models/user.model.js";
import { buildQuery } from "../utils/buildQuery.js";
import type { merchantUpdateInput } from "../schemas/merchant.schema.js";
import { extractPublicIdFromUrl } from "../utils/extractPublicIdFromUrl.js";
import cloudinary from "../config/cloudinary.js";
import { imageUpload } from "../utils/imageUpload.js";
import MerchantFavorite from "../models/merchantFavorite.model.js";
import { ApiError } from "../utils/apiError.js";
import Product from "../models/product.model.js";
import type { UserCoordinatesObj } from "../types/types.js";
import { EARTH_RADIUS } from "../config/constants.js";
import { formatSortName } from "../utils/formatSortName.js";
import type { RequestType } from "../controller/merchant.controller.js";
import { createNotification } from "./notification.service.js";

export const merchantRejectOrder = async (
  orderId: string,
  merchantId: string,
) => {
  const session = await mongoose.startSession();
  const order = await Order.findOne({
    _id: orderId,
    merchant: merchantId,
  }).session(session);
  if (!order) {
    throw new NotFoundError("Order");
  }
  if (order.status !== "Pending") {
    throw new ConflictError("Only pending orders can be rejected");
  }

  const driver = order.driver
    ? await Driver.findById(order.driver).session(session)
    : null;
  if (order.driver && !driver) {
    throw new NotFoundError("Driver");
  }

  try {
    await session.withTransaction(async () => {
      order.status = "Rejected";
      order.rejectedAt = new Date();
      order.cancelledBy = "Merchant";
      order.cancelledAt = new Date();
      if (driver) {
        driver.activeOrder = null;
        driver.isAvailable = true;
        driver.workingStatus = "Available";
      }

      await order.save({ session });
      if (driver) await driver.save({ session });
    });
  } finally {
    await session.endSession();
  }

  const driverId = order.driver ? order.driver.toString() : null;
  const customerId = order.customer ? order.customer.toString() : null;

  if (order.customer) {
    await createNotification({
      targetId: order.customer,
      targetType: "Customer",
      type: "ORDER_REJECTED",
      title: "Order rejected",
      message: `Order #${order.orderNumber} was rejected by the store.`,
      order: order._id,
    });
  }

  if (driverId) io.to(`driver:${driverId}`).emit("order:rejected");
  if (customerId) io.to(`customer:${customerId}`).emit("order:rejected");

  return order;
};

export const merchantAcceptOrder = async (
  orderId: string,
  merchantId: string,
) => {
  const order = await Order.findOne({ _id: orderId, merchant: merchantId });

  if (!order) {
    throw new NotFoundError("Order");
  }

  if (order.status !== "Pending") {
    throw new ConflictError("Only pending orders can be accepted");
  }

  order.merchantReceivedAt = new Date();
  order.preparingAt = new Date();
  order.status = "Preparing";

  await order.save();

  io.to(`customer:${order.customer.toString()}`).emit("order:merchantAccepted");
  if (order.driver) {
    io.to(`driver:${order.driver.toString()}`).emit("order:merchantAccepted");
  }

  return order;
};

export const merchantPreparingOrder = async (
  orderId: string,
  merchantId: string,
) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new NotFoundError("Order");
  }

  if (order.merchant.toString() !== merchantId) {
    throw new ConflictError(
      "Order id provided is not equal to the order merchant Id",
    );
  }

  order.merchantReceivedAt = new Date();
  order.status = "Preparing";

  await order.save();

  io.to(`customer:${order.customer.toString()}`).emit(
    "order:merchantPreparing",
  );
  if (order.driver) {
    io.to(`driver:${order.driver.toString()}`).emit("order:merchantPreparing");
  }

  return order;
};

export const merchantReadyOrder = async (
  orderId: string,
  merchantId: string,
) => {
  const isOrderValid = await validateMerchantOrder(orderId, merchantId);

  if (!isOrderValid) {
    throw new ConflictError("There is some error. Check the console");
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw new NotFoundError("Order");
  }

  // if (order.pricing.total !== paymentCost) {
  //   throw new ConflictError(
  //     "Payment should be equal to the order's total price.",
  //   );
  // }

  order.status = "ReadyForPickup";
  order.readyForPickupAt = new Date();
  await order.save();

  if (order.driver) {
    io.to(`driver:${order.driver.toString()}`).emit("order:ready");
  }
  io.to(`customer:${order.customer.toString()}`).emit("order:ready");

  return order;
};

export const merchantCancelOrder = async (
  orderId: string,
  merchantId: string,
  cancellationReason: string,
) => {
  const order = await Order.findOne({ _id: orderId, merchant: merchantId });
  if (!order) throw new NotFoundError("Order");

  if (
    ["Delivered", "PickedUp", "Cancelled", "Rejected"].includes(order.status)
  ) {
    throw new ConflictError("Order can no longer be cancelled");
  }

  const session = await mongoose.startSession();
  const driver = order.driver
    ? await Driver.findById(order.driver).session(session)
    : null;
  if (
    driver &&
    (driver.workingStatus === "ArrivedAtMerchant" ||
      driver.workingStatus === "Delivering")
  ) {
    await session.endSession();
    throw new ConflictError(
      "Order cannot be cancelled after the driver arrives",
    );
  }

  try {
    await session.withTransaction(async () => {
      order.status = "Cancelled";
      order.payment.status = "Cancelled";
      order.cancelledAt = new Date();
      order.cancelledBy = "Merchant";
      order.cancellationReason = cancellationReason;
      await order.save({ session });

      if (driver) {
        driver.activeOrder = null;
        driver.isAvailable = true;
        driver.workingStatus = "Available";
        await driver.save({ session });
      }
    });
  } finally {
    await session.endSession();
  }

  if (driver) io.to(`driver:${driver._id}`).emit("order:cancel");
  await createNotification({
    targetId: order.customer,
    targetType: "Customer",
    type: "ORDER_CANCELLED",
    title: "Order cancelled",
    message: `Order #${order.orderNumber} was cancelled by the store.`,
    order: order._id,
  });
  io.to(`customer:${order.customer}`).emit("order:cancel");
  io.to(`merchant:${merchantId}`).emit("order:cancel");
  return order;
};

const validateMerchantOrder = async (orderId: string, merchantId: string) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new NotFoundError("Order");
  }

  const merchant = await Merchant.findById(merchantId);
  if (!merchant) {
    throw new NotFoundError("Merchant");
  }

  if (order.merchant.toString() !== merchant._id.toString()) {
    throw new ConflictError("This order doesn't belong to this merchant");
  }

  if (order.status !== "Preparing") {
    throw new ConflictError(
      "Order must be preparing before it can be marked ready",
    );
  }

  if (order.rejectedAt) {
    throw new ConflictError("Order is rejected already");
  }

  if (order.cancelledBy) {
    throw new ConflictError("Order is cancelled already");
  }

  if (order.cancelledAt) {
    throw new ConflictError("Order is cancelled already");
  }

  if (order.pickedUpAt) {
    throw new ConflictError("Order already picked up");
  }

  if (order.deliveredAt) {
    throw new ConflictError("Order already picked up");
  }

  if (order.payment.method !== "Cash" && !order.payment.transactionId) {
    throw new ConflictError(
      "Order payment method is not cash but no transaction id found",
    );
  }

  return true;
};

export const getMerchantsService = async (
  payload: any,
  coordinates?: UserCoordinatesObj,
) => {
  const queryData = buildQuery(payload);

  const allowedSorts = [
    "merchantName",
    "-merchantName",
    "status",
    "-status",
    "ratingCount",
    "-ratingCount",
    "averageRating",
    "-averageRating",
    "isOpen",
    "-isOpen",
  ];

  const sort = allowedSorts.includes(queryData.sort)
    ? queryData.sort
    : "-isOpen";

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

  if (payload.open === "true") {
    queryData.filter.isOpen = true;
  }

  const maxDist = Number(payload.maxDist);
  if (coordinates && maxDist > 0 && maxDist < 50) {
    const radiusInRadians = maxDist / EARTH_RADIUS;

    queryData.filter["address.location"] = {
      $geoWithin: {
        $centerSphere: [[coordinates.lng, coordinates.lat], radiusInRadians],
      },
    };
  }

  const docs = await Merchant.find(queryData.filter)
    .sort(sort)
    .select(queryData.select)
    .skip(queryData.skip)
    .limit(queryData.limit);

  const limitedDocs = docs.map((doc) => ({
    _id: doc._id,
    merchantName: doc.merchantName,
    description: doc.description,
    phoneNumber: doc.phoneNumber,
    logo: doc.logo,
    banner: doc.banner,
    address: doc.address,
    operatingHours: doc.operatingHours,
    ratingCount: doc.ratingCount,
    averageRating: doc.averageRating,
    isOpen: doc.isOpen,
  }));

  const total = await Merchant.countDocuments(queryData.filter);

  return { limitedDocs, total, queryData };
};

export const getMerchantProductsService = async (
  payload: any,
  merchantId: string,
  requestType: RequestType,
  userId?: string,
) => {
  const queryData = buildQuery(payload);
  const allowedSorts = [
    "price",
    "-price",
    "createdAt",
    "-createdAt",
    "name",
    "-name",
  ];

  const sort = allowedSorts.includes(queryData.sort)
    ? queryData.sort
    : "-createdAt";
  let filter = { ...queryData.filter };

  if (requestType === "public") {
    filter = {
      ...queryData.filter,
      merchant: merchantId,
      isAvailable: true,
    };
  } else if (requestType === "merchant" && userId) {
    const merchant = await Merchant.findById(merchantId);

    if (!merchant) {
      throw new NotFoundError("Merchant");
    }

    if (merchant.owner.toString() !== userId) {
      throw new ConflictError(
        "Owner of this merchant is different from this user",
      );
    }
    filter = {
      ...queryData.filter,
      merchant: merchantId,
    };
  } else {
    throw new ConflictError("Invalid merchant product request type");
  }

  if (queryData.search) {
    filter.name = {
      $regex: queryData.search,
      $options: "i",
    };
  }
  const [docs, merchant, total] = await Promise.all([
    Product.find(filter)
      .sort(sort)
      .select(queryData.select)
      .skip(queryData.skip)
      .limit(queryData.limit),
    Merchant.findById(merchantId),
    Product.countDocuments(filter),
  ]);

  if (!merchant) {
    throw new NotFoundError("Merchant");
  }

  return { docs, merchant, total, queryData };
};

export const updateMerchantProfileService = async (
  userId: string,
  merchantId: string,
  payload: merchantUpdateInput,
  logo: Express.Multer.File | undefined,
  banner: Express.Multer.File | undefined,
) => {
  const merchant = await Merchant.findOne({
    owner: userId,
    _id: merchantId,
  });

  if (!merchant) {
    throw new NotFoundError("Merchant");
  }

  const updateData: Partial<IMerchant> = {};

  if (payload?.merchantName !== undefined) {
    updateData.merchantName = payload.merchantName;
  }

  if (payload?.description !== undefined) {
    updateData.description = payload.description;
  }

  if (payload?.phoneNumber !== undefined) {
    updateData.phoneNumber = payload.phoneNumber;
  }

  if (payload?.address !== undefined) {
    updateData.address = {
      ...payload.address,
      location: payload.address.location ?? {
        type: "Point",
        coordinates: [0, 0],
      },
    };
  }

  if (payload?.operatingHours !== undefined) {
    updateData.operatingHours =
      payload.operatingHours as IMerchant["operatingHours"];
  }

  if (payload?.minimumOrder !== undefined) {
    updateData.minimumOrder = payload.minimumOrder;
  }

  if (logo) {
    if (merchant.logo) {
      const publicId = extractPublicIdFromUrl(merchant.logo);
      if (publicId) {
        const result = await cloudinary.uploader.destroy(publicId);
        if (result.result !== "ok") {
          console.warn(
            `Cloudinary cleanup failed for ${publicId}: ${result.result}`,
          );
        }
      }
    }
    const cloudinaryImageUrl = await imageUpload(logo, "merchant/logo");
    updateData.logo = cloudinaryImageUrl;
  }

  if (banner) {
    if (merchant.banner) {
      const publicId = extractPublicIdFromUrl(merchant.banner);
      if (publicId) {
        const result = await cloudinary.uploader.destroy(publicId);
        if (result.result !== "ok") {
          console.warn(
            `Cloudinary cleanup failed for ${publicId}: ${result.result}`,
          );
        }
      }
    }
    const cloudinaryImageUrl = await imageUpload(banner, "merchant/banner");
    updateData.banner = cloudinaryImageUrl;
  }

  merchant.set(updateData);
  await merchant.save();

  return merchant;
};

export const getMerchantAnalyticsService = async (
  userId: string,
  period: "7d" | "30d" | "90d",
) => {
  const merchant = await Merchant.findOne({ owner: userId }).select("_id");
  if (!merchant) throw new NotFoundError("Merchant");

  const days = Number(period.slice(0, -1));
  const startDate = new Date();
  startDate.setUTCDate(startDate.getUTCDate() - days + 1);
  startDate.setUTCHours(0, 0, 0, 0);

  const [result] = await Order.aggregate([
    { $match: { merchant: merchant._id } },
    {
      $facet: {
        orders: [
          {
            $match: {
              $expr: {
                $gte: [
                  {
                    $ifNull: [
                      "$createdAt",
                      { $ifNull: ["$acceptedAt", "$deliveredAt"] },
                    ],
                  },
                  startDate,
                ],
              },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              active: {
                $sum: {
                  $cond: [
                    {
                      $in: [
                        "$status",
                        ["Pending", "Preparing", "ReadyForPickup", "PickedUp"],
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
              completed: {
                $sum: { $cond: [{ $eq: ["$status", "Delivered"] }, 1, 0] },
              },
              cancelled: {
                $sum: {
                  $cond: [
                    {
                      $in: [
                        "$status",
                        ["Cancelled", "Rejected", "NoDriverFound"],
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
            },
          },
        ],
        revenue: [
          {
            $match: {
              status: "Delivered",
              deliveredAt: { $gte: startDate },
            },
          },
          { $group: { _id: null, total: { $sum: "$pricing.subtotal" } } },
        ],
        trend: [
          {
            $match: {
              status: "Delivered",
              deliveredAt: { $gte: startDate },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$deliveredAt" },
              },
              revenue: { $sum: "$pricing.subtotal" },
              orders: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ],
        topProducts: [
          {
            $match: {
              status: "Delivered",
              deliveredAt: { $gte: startDate },
            },
          },
          { $unwind: "$items" },
          {
            $group: {
              _id: "$items.product",
              name: { $first: "$items.productName" },
              quantity: { $sum: "$items.quantity" },
              revenue: { $sum: "$items.subtotal" },
            },
          },
          { $sort: { quantity: -1 } },
          { $limit: 5 },
        ],
      },
    },
  ]);

  const orderStats = result?.orders?.[0] ?? {
    total: 0,
    active: 0,
    completed: 0,
    cancelled: 0,
  };
  const revenue = result?.revenue?.[0]?.total ?? 0;

  return {
    period,
    revenue,
    averageOrderValue: orderStats.completed
      ? revenue / orderStats.completed
      : 0,
    ...orderStats,
    trend: result?.trend ?? [],
    topProducts: result?.topProducts ?? [],
  };
};

export const getMerchantDashboardService = async (userId: string) => {
  const merchant = await Merchant.findOne({ owner: userId }).select(
    "_id merchantName isOpen",
  );
  if (!merchant) throw new NotFoundError("Merchant");

  const startOfDay = new Date();
  const manilaTime = new Date(startOfDay.getTime() + 8 * 60 * 60 * 1000);
  manilaTime.setUTCHours(0, 0, 0, 0);
  startOfDay.setTime(manilaTime.getTime() - 8 * 60 * 60 * 1000);
  const activeStatuses: IOrder["status"][] = [
    "Pending",
    "Preparing",
    "ReadyForPickup",
    "PickedUp",
  ];

  const [sales, todayOrders, activeOrders, pendingOrders, recentOrders] =
    await Promise.all([
      Order.aggregate([
        {
          $match: {
            merchant: merchant._id,
            status: "Delivered",
            deliveredAt: { $gte: startOfDay },
          },
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: "$pricing.subtotal" },
          },
        },
      ]),
      Order.countDocuments({
        merchant: merchant._id,
        createdAt: { $gte: startOfDay },
      }),
      Order.countDocuments({
        merchant: merchant._id,
        status: { $in: activeStatuses },
      }),
      Order.countDocuments({ merchant: merchant._id, status: "Pending" }),
      Order.find({ merchant: merchant._id })
        .select(
          "orderNumber status pricing.total items.productName items.quantity createdAt",
        )
        .sort({ createdAt: -1, acceptedAt: -1 })
        .limit(6)
        .lean(),
    ]);

  return {
    merchant,
    todayRevenue: sales[0]?.revenue ?? 0,
    todayOrders,
    activeOrders,
    pendingOrders,
    recentOrders,
  };
};

export const toggleMerchantFavoriteService = async (
  user: IUser,
  merchantId: string,
) => {
  const merchant = await Merchant.findById(merchantId);

  if (!merchant) {
    throw new NotFoundError("Merchant");
  }

  const favoriteExist = await MerchantFavorite.findOne({
    user: user._id,
    merchant: merchant._id,
  });

  if (favoriteExist) {
    await MerchantFavorite.findByIdAndDelete(favoriteExist._id);
    return { isFavorite: false };
  }

  await MerchantFavorite.create({
    user: user._id,
    merchant: merchant._id,
  });

  return { isFavorite: true };
};

export const deleteMerchantFavoriteService = async (
  userId: string,
  merchantId: string,
) => {
  const result = await MerchantFavorite.findOneAndDelete({
    user: userId,
    merchant: merchantId,
  });

  if (!result) {
    throw new ApiError(500, "Unable to delete favorite merchant");
  }

  return "Merchant successfully removed as favorite";
};

export const getMerchantFavoritesService = async (
  query: any,
  userId: string,
  coordinates?: UserCoordinatesObj,
) => {
  const queryData = buildQuery(query);

  const updatedSort = query.sort ? formatSortName(query.sort, "merchant") : "";

  const allowedSorts = [
    "merchant.merchantName",
    "-merchant.merchantName",
    "merchant.averageRating",
    "-merchant.averageRating",
    "merchant.isOpen",
    "-merchant.isOpen",
    "merchant.ratingCount",
    "-merchant.ratingCount",
  ];

  const sort = allowedSorts.includes(updatedSort)
    ? updatedSort
    : "-merchant.isOpen";

  const merchantMatch: any = {};

  if (
    queryData.filter.averageRating &&
    (queryData.filter.averageRating.$gte > 0 ||
      queryData.filter.averageRating.$lte < 5)
  ) {
    merchantMatch["merchant.averageRating"] = queryData.filter.averageRating;
  }

  if (query.open === "true") {
    merchantMatch["merchant.isOpen"] = true;
  }

  const maxDist = Number(query.maxDist);
  if (coordinates && maxDist > 0 && maxDist < 50) {
    const radiusInRadians = maxDist / EARTH_RADIUS;

    merchantMatch["merchant.address.location"] = {
      $geoWithin: {
        $centerSphere: [[coordinates.lng, coordinates.lat], radiusInRadians],
      },
    };
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);

  const docs = await MerchantFavorite.aggregate([
    { $match: { user: userObjectId } },

    {
      $lookup: {
        from: "merchants",
        localField: "merchant",
        foreignField: "_id",
        as: "merchant",
      },
    },
    { $unwind: "$merchant" },

    { $match: merchantMatch },

    {
      $sort: {
        [sort.replace("-", "")]: sort.startsWith("-") ? -1 : 1,
      },
    },

    { $skip: queryData.skip },
    { $limit: queryData.limit },
  ]);

  const totalAgg = await MerchantFavorite.aggregate([
    { $match: { user: userObjectId } },
    {
      $lookup: {
        from: "merchants",
        localField: "merchant",
        foreignField: "_id",
        as: "merchant",
      },
    },
    { $unwind: "$merchant" },
    { $match: merchantMatch },
    { $count: "total" },
  ]);

  const total = totalAgg[0]?.total ?? 0;

  return { docs, total, queryData };
};

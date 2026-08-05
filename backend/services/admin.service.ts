import mongoose from "mongoose";
import Driver from "../models/driver.model.js";
import Order from "../models/order.model.js";
import type { IUser } from "../models/user.model.js";
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/errors.js";
import type { PeriodType } from "../controller/admin.controller.js";
import { string } from "zod";
import Merchant from "../models/merchant.model.js";
import { ApiError } from "../utils/apiError.js";
import Product from "../models/product.model.js";

export const cancelOrderService = async (user: IUser, orderId: string) => {
  const session = await mongoose.startSession();
  if (!user.role.includes("Admin")) {
    throw new UnauthorizedError("Unauthorized user");
  }

  const order = await Order.findById(orderId);

  if (!order) {
    throw new NotFoundError("Order");
  }

  const driver = await Driver.findById(order.driver);

  if (!driver) {
    throw new NotFoundError("Driver");
  }

  if (driver.activeOrder !== order._id) {
    throw new ConflictError(
      "Driver's active order is not equal to the provided order's id",
    );
  }

  if (order.status === "Delivered" || order.status === "Cancelled") {
    throw new ConflictError("Order cannot be cancelled");
  }

  try {
    await session.withTransaction(async () => {
      order.payment.status = "Cancelled";
      order.status = "Cancelled";
      order.cancelledAt = new Date();
      order.cancelledBy = "Admin";

      driver.activeOrder = null;
      driver.workingStatus = "Available";
      driver.isAvailable = true;
      driver.cancelledDeliveries += 1;
      await order.save({ session });
      await driver.save({ session });
    });
  } finally {
    await session.endSession();
  }
};

export const getRevenueAnalyticsService = async (period: PeriodType) => {
  let groupBy;

  switch (period) {
    case "hour":
      groupBy = { $hour: "$deliveredAt" };
      break;
    case "hour":
      groupBy = { $day: "$deliveredAt" };
      break;
    case "hour":
      groupBy = { $week: "$deliveredAt" };
      break;
    case "hour":
      groupBy = { $year: "$deliveredAt" };
      break;
    default:
      groupBy = { $day: "$deliveredAt" };
      break;
  }

  const revenue = await Order.aggregate([
    {
      $match: {
        status: "Delivered",
      },
    },
    {
      $group: {
        _id: groupBy,
        revenue: {
          $sum: "$pricing.total",
        },
        orders: {
          $sum: 1,
        },
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
  ]);

  return revenue;
};

type OrderAnalytics = {
  Pending: number;
  ReadyForPickup: number;
  Delivering: number;
  Delivered: number;
  Cancelled: number;
  Rejected: number;
};

export const getOrderAnalyticsService = async (user: IUser) => {
  if (!user.role.includes("Admin")) {
    throw new UnauthorizedError("Unauthorized user");
  }

  const orderCounts = await Order.aggregate([
    {
      $group: {
        _id: "$status",
        count: {
          $sum: 1,
        },
      },
    },
  ]);

  const analytics = orderCounts.reduce<OrderAnalytics>(
    (acc, order: { _id: keyof OrderAnalytics; count: number }) => {
      acc[order._id] = order.count;
      return acc;
    },
    {
      Pending: 0,
      ReadyForPickup: 0,
      Delivering: 0,
      Delivered: 0,
      Cancelled: 0,
      Rejected: 0,
    },
  );

  return {
    activeOrders:
      analytics.Pending + analytics.ReadyForPickup + analytics.Delivering,
    completedOrders: analytics.Delivered,
    cancelledOrders: analytics.Cancelled + analytics.Rejected,
  };
};

export const getTopMerchantsService = async (limit: number) => {
  const topMerchantRevenue = await Merchant.find({})
    .sort("-totalRevenue")
    .limit(limit)
    .select("name totalRevenue completedOrders averageRating");
  const topMerchantCompletedOrders = await Merchant.find({})
    .sort("-completedOrders")
    .limit(limit)
    .select("name totalRevenue completedOrders averageRating");

  return {
    revenue: topMerchantRevenue,
    completedOrders: topMerchantCompletedOrders,
  };
};

export const getTopDriversService = async (limit: number) => {
  const topDriverTotalEarnings = await Driver.find({})
    .sort("-totalEarnings")
    .limit(limit)
    .select("completedDeliveries totalEarnings averageRating")
    .populate("user", "firstName lastName email");
  const topDriverCompletedDeliveries = await Driver.find({})
    .sort("-completedDeliveries")
    .limit(limit)
    .select("completedDeliveries totalEarnings averageRating")
    .populate("user", "firstName lastName email");

  return {
    totalEarning: topDriverTotalEarnings,
    completedDeliveries: topDriverCompletedDeliveries,
  };
};

export const getTopProductsService = async (limit: number) => {
  const topProductTotalSold = await Product.find({})
    .sort("-totalSold")
    .limit(limit)
    .select("name totalSold");

  return {
    totalSold: topProductTotalSold,
  };
};

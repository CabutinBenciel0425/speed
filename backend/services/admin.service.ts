import mongoose from "mongoose";
import Driver from "../models/driver.model.js";
import Order, { type IOrder } from "../models/order.model.js";
import type { IUser } from "../models/user.model.js";
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/errors.js";
import type { PeriodType } from "../controller/admin.controller.js";
import Merchant from "../models/merchant.model.js";
import Product from "../models/product.model.js";

export const cancelOrderService = async (user: IUser, orderId: string) => {
  if (!user.role.includes("Admin")) {
    throw new UnauthorizedError("Unauthorized user");
  }

  const session = await mongoose.startSession();
  let result: IOrder | null = null;

  try {
    await session.withTransaction(async () => {
      const order = await Order.findById(orderId).session(session);
      if (!order) throw new NotFoundError("Order");
      if (["Delivered", "Cancelled", "Rejected"].includes(order.status)) {
        throw new ConflictError("Order cannot be cancelled");
      }

      if (order.driver) {
        const driver = await Driver.findById(order.driver).session(session);
        if (driver?.activeOrder?.toString() === order._id.toString()) {
          driver.activeOrder = null;
          driver.workingStatus = "Available";
          driver.isAvailable = driver.status === "Operational";
          driver.cancelledDeliveries += 1;
          await driver.save({ session });
        }
      }

      order.payment.status = "Cancelled";
      order.status = "Cancelled";
      order.cancelledAt = new Date();
      order.cancelledBy = "Admin";
      order.cancellationReason = "Cancelled by administrator";
      await order.save({ session });
      result = order;
    });
  } finally {
    await session.endSession();
  }

  return result;
};

export const getRevenueAnalyticsService = async (period: PeriodType) => {
  const format = {
    hour: "%Y-%m-%d %H:00",
    day: "%Y-%m-%d",
    week: "%G-W%V",
    month: "%Y-%m",
  }[period];

  const revenue = await Order.aggregate([
    {
      $match: {
        status: "Delivered",
        "payment.status": "Paid",
      },
    },
    {
      $group: {
        _id: { $dateToString: { format, date: "$deliveredAt" } },
        revenue: {
          $sum: "$pricing.subtotal",
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

export const getOrderAnalyticsService = async (user: IUser) => {
  if (!user.role.includes("Admin")) {
    throw new UnauthorizedError("Unauthorized user");
  }

  const [activeOrders, completedOrders, cancelledOrders] = await Promise.all([
    Order.countDocuments({ status: { $in: ["Pending", "Preparing", "ReadyForPickup", "PickedUp"] } }),
    Order.countDocuments({ status: "Delivered" }),
    Order.countDocuments({ status: { $in: ["Cancelled", "Rejected", "NoDriverFound"] } }),
  ]);

  return {
    activeOrders,
    completedOrders,
    cancelledOrders,
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

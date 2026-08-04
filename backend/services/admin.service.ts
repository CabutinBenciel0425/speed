import mongoose from "mongoose";
import Driver from "../models/driver.model.js";
import Order from "../models/order.model.js";
import type { IUser } from "../models/user.model.js";
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/errors.js";

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

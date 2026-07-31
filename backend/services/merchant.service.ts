import mongoose from "mongoose";
import Order from "../models/order.model.js";
import { ConflictError, NotFoundError } from "../utils/errors.js";
import Merchant from "../models/merchant.model.js";
import Driver from "../models/driver.model.js";
import { io } from "../server.js";
import User from "../models/user.model.js";

export const merchantRejectOrder = async (orderId: string, userId: string) => {
  const session = await mongoose.startSession();
  const isOrderValid = await validateMerchantOrder(orderId, userId);

  if (!isOrderValid) {
    throw new ConflictError("There is some error. Check the console");
  }

  const order = await Order.findById(orderId).session(session);
  if (!order) {
    throw new NotFoundError("Order");
  }

  const driver = await Driver.findById(order.driver).session(session);
  if (!driver) {
    throw new NotFoundError("Driver");
  }

  try {
    await session.withTransaction(async () => {
      order.status = "Rejected";
      order.rejectedAt = new Date();
      order.cancelledBy = "Merchant";
      order.cancelledAt = new Date();
      driver.activeOrder = null;
      driver.isAvailable = true;
      driver.workingStatus = "Available";

      await order.save({ session });
      await driver.save({ session });
    });
  } finally {
    await session.endSession();
  }

  const driverId = order.driver ? order.driver.toString() : null;
  const customerId = order.customer ? order.customer.toString() : null;

  if (driverId) io.to(`driver:${driverId}`).emit("order:rejected");
  if (customerId) io.to(`customer:${customerId}`).emit("order:rejected");

  return order;
};

export const merchantReadyOrder = async (orderId: string, userId: string) => {
  const isOrderValid = await validateMerchantOrder(orderId, userId);

  if (!isOrderValid) {
    throw new ConflictError("There is some error. Check the console");
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw new NotFoundError("Order");
  }

  const driver = await Driver.findById(order.driver);
  if (!driver) {
    throw new NotFoundError("Driver");
  }

  order.status = "ReadyForPickup";
  order.readyForPickupAt = new Date();
  await order.save();

  io.to(`driver:${driver._id}`).emit("order:ready");

  return order;
};

export const merchantAcceptOrder = async (orderId: string, userId: string) => {
  const user = await User.findById(userId);
  const order = await Order.findById(orderId);
  if (!user) {
    throw new NotFoundError("User");
  }
  if (!order) {
    throw new NotFoundError("Order");
  }

  order.merchantReceivedAt = new Date();
  order.status = "Preparing";

  await order.save();

  io.to(`customer:${order.customer.toString()}`).emit("order:preparing");

  return order;
};

const validateMerchantOrder = async (orderId: string, userId: string) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new NotFoundError("Order");
  }

  const merchant = await Merchant.findOne({ owner: userId });
  if (!merchant) {
    throw new NotFoundError("Merchant");
  }

  if (order.merchant.toString() !== merchant._id.toString()) {
    throw new ConflictError("This order doesn't belong to this merchant");
  }

  if (order.driver === null) {
    throw new ConflictError("Order must have assigned driver first");
  }

  if (order.status !== "Pending") {
    throw new ConflictError("Order's status should be 'Pending' first");
  }

  if (order.acceptedAt === null) {
    throw new ConflictError("Order must have assigned driver first");
  }

  if (order.rejectedAt !== null) {
    throw new ConflictError("Order is rejected already");
  }

  if (order.cancelledBy !== null) {
    throw new ConflictError("Order is cancelled already");
  }

  if (order.cancelledAt !== null) {
    throw new ConflictError("Order is cancelled already");
  }

  if (order.pickedUpAt !== null) {
    throw new ConflictError("Order already picked up");
  }

  if (order.deliveredAt !== null) {
    throw new ConflictError("Order already picked up");
  }

  if (order.merchantReceivedAt === null) {
    throw new ConflictError("Merchant haven't received the order yet");
  }

  if (order.driverAssignedAt === null) {
    throw new ConflictError("Order must have assigned driver first");
  }

  if (order.payment.method !== "Cash" && order.payment.transactionId === null) {
    throw new ConflictError(
      "Order payment method is not cash but no transaction id found",
    );
  }

  return true;
};

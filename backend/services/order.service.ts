import mongoose from "mongoose";
import Order from "../models/order.model.js";
import Address from "../models/address.model.js";
import { ConflictError, NotFoundError } from "../utils/errors.js";
import Merchant from "../models/merchant.model.js";
import { recalculateCart } from "./cart.service.js";
import Cart from "../models/cart.model.js";
import { generateOrderNumber } from "../utils/generateOrderNumber.js";
import Driver from "../models/driver.model.js";
import { io } from "../server.js";

export const createNewOrder = async (userId: string) => {
  await recalculateCart(userId);

  const cart = await Cart.findOne({ customer: userId });
  if (!cart) {
    throw new NotFoundError("Cart");
  }
  const merchant = await Merchant.findById(cart?.merchant);
  const address = await Address.findOne({ user: userId, isDefault: true });

  if (!merchant) {
    throw new NotFoundError("Merchant");
  }

  if (!address) {
    throw new ConflictError("There is no default address selected");
  }

  const newOrder = new Order({
    customer: cart.customer,
    merchant: cart.merchant,
    orderNumber: generateOrderNumber(),
    deliveryAddress: cart.deliveryAddress,
    payment: {
      method: cart?.payment?.method,
      status: "Pending",
      transactionId: null,
    },
    pricing: {
      subtotal: cart?.pricing?.subtotal,
      serviceFee: cart?.pricing?.serviceFee,
      discount: cart?.pricing?.discount,
      deliveryFee: cart?.pricing?.deliveryFee,
      total: cart?.pricing?.total,
    },
    status: "Pending",
    customerNote: cart.customerNote,
    estimatedPreparationTime: cart.estimatedPreparationTime,
    estimatedDeliveryTime: cart.estimatedDeliveryTime,
    driver: null,
  });
  await newOrder.save();

  await Cart.findByIdAndDelete(cart._id);

  return newOrder;
};

export const cancelOrderService = async (orderId: string, userId: string) => {
  const session = await mongoose.startSession();
  const order = await Order.findOne({ user: userId, _id: orderId }).session(
    session,
  );

  if (!order) {
    throw new NotFoundError("Order");
  }

  const merchant = await Merchant.findById(order.merchant);

  if (!merchant) {
    throw new NotFoundError("Merchant");
  }

  const driver = order.driver
    ? await Driver.findById(order.driver).session(session)
    : null;

  const driverAlreadyAtMerchant =
    driver &&
    (driver.workingStatus === "ArrivedAtMerchant" ||
      driver.workingStatus === "Delivering");

  if (
    order.status === "Delivered" ||
    order.status === "Cancelled" ||
    driverAlreadyAtMerchant
  ) {
    throw new ConflictError("Order cannot be cancelled");
  }
  if (!order.payment) {
    throw new NotFoundError("Payment information not found");
  }

  try {
    await session.withTransaction(async () => {
      order.payment.status = "Cancelled";
      order.status = "Cancelled";
      order.cancelledAt = new Date();
      order.cancelledBy = "Customer";
      await order.save({ session });
      if (driver) {
        driver.activeOrder = null;
        driver.workingStatus = "Available";
        driver.isAvailable = true;
        driver.cancelledDeliveries += 1;

        await driver.save({ session });
      }
    });
  } finally {
    await session.endSession();
  }

  if (driver) {
    io.to(`driver:${driver._id}`).emit("order:cancel");
  }

  io.to(`merchant:${merchant._id}`).emit("order:cancel");
  io.to(`customer:${order.customer}`).emit("order:cancel");

  return order;
};

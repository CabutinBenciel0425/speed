import type { createOrderInput } from "../schemas/order.schema.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import type { Request, Response } from "express";
import { ConflictError, NotFoundError } from "../utils/errors.js";
import { createNewOrder } from "../services/order.service.js";
import Order from "../models/order.model.js";

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const payload: createOrderInput = req.body;

  if (!user) {
    throw new NotFoundError("User");
  }

  const newOrder = await createNewOrder(user._id.toString(), payload);

  res.status(201).json({
    success: true,
    data: newOrder,
  });
});

export const getOrders = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    throw new NotFoundError("User");
  }
  const order = await Order.find({ customer: user._id });

  res.status(201).json({
    success: true,
    data: order || "No order done yet",
  });
});

export const getOrder = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const orderId = req.params.orderId;

  if (!user) {
    throw new NotFoundError("User");
  }
  const order = await Order.findById(orderId);

  if (!order) {
    throw new NotFoundError("Order");
  }

  res.status(200).json({
    success: true,
    data: order,
  });
});

export const cancelOrder = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const orderId = req.params.orderId;

  if (!user) {
    throw new NotFoundError("User");
  }
  const order = await Order.findById(orderId);

  if (!order) {
    throw new NotFoundError("Order");
  }

  if (order.status === "Delivered" || order.status === "Cancelled") {
    throw new ConflictError("Order cannot be cancelled");
  }
  if (!order.payment) {
    throw new NotFoundError("Payment information not found");
  }

  order.payment.status = "Cancelled";
  order.payment.transactionId = null;
  order.status = "Cancelled";

  order.cancelledAt = new Date();

  await order.save();

  res.status(200).json({
    success: true,
    data: order,
  });
});

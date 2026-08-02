import type { createOrderInput } from "../schemas/order.schema.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import type { Request, Response } from "express";
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/errors.js";
import {
  cancelOrderService,
  createNewOrder,
} from "../services/order.service.js";
import Order from "../models/order.model.js";
import { buildQuery } from "../utils/buildQuery.js";

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    throw new NotFoundError("User");
  }

  const newOrder = await createNewOrder(user._id.toString());

  res.status(201).json({
    success: true,
    data: newOrder,
  });
});

export const getOrders = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const queryData = buildQuery(req.query);
  const allowedSorts = ["createdAt", "-createdAt", "total", "-total"];

  const sort = allowedSorts.includes(queryData.sort) ? queryData.sort : "-name";

  if (queryData.search) {
    queryData.filter.name = {
      $regex: queryData.search,
      $options: "i",
    };
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

export const getOrdersByAdmin = asyncHandler(
  async (req: Request, res: Response) => {
    const queryData = buildQuery(req.query);
    const allowedSorts = ["createdAt", "-createdAt", "total", "-total"];

    const sort = allowedSorts.includes(queryData.sort)
      ? queryData.sort
      : "-name";

    if (queryData.search) {
      queryData.filter.name = {
        $regex: queryData.search,
        $options: "i",
      };
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
  },
);

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

  if (order.customer.toString() === user._id.toString()) {
    throw new UnauthorizedError("This order does not belong to this user");
  }

  res.status(200).json({
    success: true,
    data: order,
  });
});

export const cancelOrder = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const orderId = req.params.orderId as string;
  const cancellationReason: string = req.body;

  if (!user) {
    throw new NotFoundError("User");
  }
  const cancelledOrder = await cancelOrderService(user._id.toString(), orderId);

  res.status(200).json({
    success: true,
    data: cancelledOrder,
  });
});

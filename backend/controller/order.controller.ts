import { asyncHandler } from "../utils/asyncHandler.js";
import type { Request, Response } from "express";
import { NotFoundError, UnauthorizedError } from "../utils/errors.js";
import {
  cancelOrderServiceCustomer,
  createOrderForCODService,
  retryDriverSearchService,
} from "../services/order.service.js";
import Order from "../models/order.model.js";
import { buildQuery } from "../utils/buildQuery.js";

export const createOrderForCOD = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) {
      throw new NotFoundError("User");
    }

    const order = await createOrderForCODService(user._id.toString());

    res.status(201).json({
      success: true,
      data: order,
    });
  },
);

export const getOrders = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const queryData = buildQuery(req.query);
  const allowedSorts = ["createdAt", "-createdAt", "total", "-total"];

  if (!user) {
    throw new UnauthorizedError("Unauthorized user");
  }

  queryData.filter.customer = user._id;

  const sort = allowedSorts.includes(queryData.sort)
    ? queryData.sort
    : "-createdAt";

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

  res.status(200).json({
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

    res.status(200).json({
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

  const userRoles: ["Admin", "Customer", "Merchant", "Driver"] = [
    "Admin",
    "Customer",
    "Merchant",
    "Driver",
  ];

  if (req.userRole && !userRoles.includes(req.userRole)) {
    throw new UnauthorizedError("Role is not recognized");
  }

  await order.populate({
    path: "driver",
    select: `avatar vehicleType plateNumber user ${order.status === "PickedUp" ? " currentLocation" : ""}`,
    populate: { path: "user", select: "firstName lastName phoneNumber avatar" },
  });
  await order.populate("merchant", "merchantName");
  await order.populate("customer", "firstName lastName phoneNumber avatar");

  res.status(200).json({
    success: true,
    data: order,
  });
});

export const cancelOrderCustomer = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    const orderId = req.params.orderId as string;

    const { cancellationReason } = req.body;

    if (!user) {
      throw new NotFoundError("User");
    }
    const cancelledOrder = await cancelOrderServiceCustomer(
      orderId,
      user._id.toString(),
      cancellationReason,
    );

    res.status(200).json({
      success: true,
      data: cancelledOrder,
    });
  },
);

export const retryDriverSearch = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    const orderId = req.params.orderId as string;

    if (!user) {
      throw new NotFoundError("User");
    }

    const order = await retryDriverSearchService(orderId, user._id.toString());

    res.status(200).json({
      success: true,
      data: order,
    });
  },
);

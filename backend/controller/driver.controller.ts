import Driver from "../models/driver.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import type { Request, Response } from "express";
import { NotFoundError } from "../utils/errors.js";
import type { DriverUpdateInput } from "../schemas/driver.schema.js";
import { updateDriverProfile } from "../services/driver.service.js";
import Order from "../models/order.model.js";

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    throw new NotFoundError("User");
  }

  const driverProfile = await Driver.findOne({ user: user._id }).populate(
    "user",
  );

  res.status(200).json({
    success: true,
    data: driverProfile,
  });
});

export const updateProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    const payloadInput: DriverUpdateInput = req.body;
    const avatar = req.file;

    if (!user) {
      throw new NotFoundError("User");
    }

    const updatedDriverProfile = await updateDriverProfile(
      {
        ...payloadInput,
        avatar,
      },
      user._id.toString(),
    );

    res.status(200).json({
      success: true,
      data: updatedDriverProfile,
    });
  },
);

export const toggleDriverAvailability = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;

    if (!user) {
      throw new NotFoundError("User");
    }

    const driverProfile = await Driver.findOne({ user: user._id }).populate(
      "user",
    );

    if (!driverProfile) {
      throw new NotFoundError("Driver profile");
    }

    driverProfile.isAvailable = !driverProfile.isAvailable;

    await driverProfile.save();

    res.status(200).json({
      success: true,
      data: driverProfile,
    });
  },
);

export const getLocation = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const location: [number, number] = req.body;
  if (!user) {
    throw new NotFoundError("User");
  }

  const driverProfile = await Driver.findOne({ user: user._id }).populate(
    "user",
  );

  if (!driverProfile) {
    throw new NotFoundError("Driver profile");
  }

  driverProfile.currentLocation = {
    type: "Point",
    coordinates: location,
  };

  await driverProfile.save();

  res.status(200).json({
    success: true,
    data: driverProfile,
  });
});

// GET    /driver/orders/current
export const getCurrentOrder = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;

    if (!user) {
      throw new NotFoundError("User");
    }

    const driverProfile = await Driver.findOne({ user: user._id }).populate(
      "user",
    );

    if (!driverProfile) {
      throw new NotFoundError("Driver profile");
    }

    const currentOrder = await Order.findOne({
      driver: driverProfile._id,
      status: { $in: ["Preparing", "ReadyForPickup", "PickedUp"] },
    });

    if (!currentOrder) {
      return res.status(200).json({
        success: true,
        message: "No current order",
      });
    }

    res.status(200).json({
      success: true,
      data: currentOrder,
    });
  },
);

// GET    /driver/orders/history
export const getOrderHistory = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;

    if (!user) {
      throw new NotFoundError("User");
    }

    const driverProfile = await Driver.findOne({ user: user._id }).populate(
      "user",
    );

    if (!driverProfile) {
      throw new NotFoundError("Driver profile");
    }

    const orderHistory = await Order.find({
      driver: driverProfile._id,
    });

    if (!orderHistory) {
      return res.status(200).json({
        success: true,
        message: "No order yet",
      });
    }

    res.status(200).json({
      success: true,
      data: orderHistory,
    });
  },
);

// PATCH  /driver/orders/:orderId/accept
export const acceptOrder = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const orderId = req.params.orderId;

  if (!user) {
    throw new NotFoundError("User");
  }

  const driverProfile = await Driver.findOne({ user: user._id }).populate(
    "user",
  );

  if (!driverProfile) {
    throw new NotFoundError("Driver profile");
  }

  const order = await Order.findById(orderId).populate("driver");

  if (!order) {
    throw new NotFoundError("Order");
  }

  const paymentMethod = order.payment?.method;
  const paymentStatus = order.payment?.status;
  const orderTransactionId = order.payment?.transactionId;

  const isPaid =
    paymentMethod !== "Cash" &&
    paymentStatus === "Paid" &&
    orderTransactionId !== null;
  const isCash =
    paymentMethod === "Cash" &&
    paymentStatus === "Pending" &&
    orderTransactionId === null;

  if (
    driverProfile.status === "Operational" &&
    driverProfile.workingStatus === "Available" &&
    order.driver === null &&
    order.status === "Pending" &&
    (isPaid || isCash)
  ) {
    order.driver = driverProfile._id;
    order.driverAssignedAt = new Date();
    driverProfile.workingStatus = "Assigned";
    driverProfile.activeOrder = order._id;
    await driverProfile.save();
    await order.save();
  }

  res.status(200).json({
    success: true,
    data: order,
  });
});

// PATCH /driver/order/:orderId/heading-to-merchant
export const headingToMerchant = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    const orderId = req.params.orderId;

    if (!user) {
      throw new NotFoundError("User");
    }

    const driverProfile = await Driver.findOne({ user: user._id }).populate(
      "user",
    );

    if (!driverProfile) {
      throw new NotFoundError("Driver profile");
    }

    const order = await Order.findOne({
      driver: driverProfile._id,
      _id: orderId,
    }).populate("driver");

    if (!order) {
      throw new NotFoundError("Order");
    }

    const paymentMethod = order.payment?.method;
    const paymentStatus = order.payment?.status;
    const orderTransactionId = order.payment?.transactionId;
    const activeOrderId = driverProfile.activeOrder?.toString();

    const isPaid =
      paymentMethod !== "Cash" &&
      paymentStatus === "Paid" &&
      orderTransactionId !== null;
    const isCash =
      paymentMethod === "Cash" &&
      paymentStatus === "Pending" &&
      orderTransactionId === null;

    if (
      driverProfile.status === "Operational" &&
      driverProfile.workingStatus === "Assigned" &&
      activeOrderId === order._id.toString() &&
      order.driver === driverProfile._id &&
      (order.status === "Preparing" || order.status === "ReadyForPickup") &&
      (isPaid || isCash)
    ) {
      driverProfile.workingStatus = "HeadingToMerchant";
      await driverProfile.save();
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  },
);

// PATCH  /driver/orders/:orderId/picked-up
export const pickUpOrder = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const orderId = req.params.orderId;

  if (!user) {
    throw new NotFoundError("User");
  }

  const driverProfile = await Driver.findOne({ user: user._id }).populate(
    "user",
  );

  if (!driverProfile) {
    throw new NotFoundError("Driver profile");
  }

  const order = await Order.findOne({
    driver: driverProfile._id,
    _id: orderId,
  });

  if (!order) {
    throw new NotFoundError("Order");
  }

  const paymentMethod = order.payment?.method;
  const paymentStatus = order.payment?.status;
  const orderTransactionId = order.payment?.transactionId;
  const activeOrderId = driverProfile.activeOrder?.toString();

  const isPaid =
    paymentMethod !== "Cash" &&
    paymentStatus === "Paid" &&
    orderTransactionId !== null;
  const isCash =
    paymentMethod === "Cash" &&
    paymentStatus === "Pending" &&
    orderTransactionId === null;

  if (
    driverProfile.status === "Operational" &&
    driverProfile.workingStatus === "HeadingToMerchant" &&
    activeOrderId === order._id.toString() &&
    order.driver === driverProfile._id &&
    order.status === "ReadyForPickup" &&
    (isPaid || isCash)
  ) {
    driverProfile.workingStatus = "Delivering";
    order.status = "PickedUp";
    order.pickedUpAt = new Date();
    driverProfile.workingStatus = "Delivering";
    await driverProfile.save();
    await order.save();
  }

  res.status(200).json({
    success: true,
    data: order,
  });
});

// PATCH  /driver/orders/:orderId/delivered
export const deliveredOrder = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    const orderId = req.params.orderId;

    if (!user) {
      throw new NotFoundError("User");
    }

    const driverProfile = await Driver.findOne({ user: user._id }).populate(
      "user",
    );

    if (!driverProfile) {
      throw new NotFoundError("Driver profile");
    }

    const order = await Order.findOne({
      driver: driverProfile._id,
      _id: orderId,
    });

    if (!order) {
      throw new NotFoundError("Order");
    }

    const paymentMethod = order.payment?.method;
    const paymentStatus = order.payment?.status;
    const orderTransactionId = order.payment?.transactionId;
    const activeOrderId = driverProfile.activeOrder?.toString();
    const deliveryFee = order.pricing?.deliveryFee || 0;

    const isPaid =
      paymentMethod !== "Cash" &&
      paymentStatus === "Paid" &&
      orderTransactionId !== null;
    const isCash =
      paymentMethod === "Cash" &&
      paymentStatus === "Pending" &&
      orderTransactionId === null;

    if (
      driverProfile.status === "Operational" &&
      driverProfile.workingStatus === "Delivering" &&
      activeOrderId === order._id.toString() &&
      order.driver === driverProfile._id &&
      order.status === "PickedUp" &&
      (isPaid || isCash)
    ) {
      driverProfile.workingStatus = "Available";
      driverProfile.completedDeliveries = driverProfile.completedDeliveries++;
      driverProfile.totalEarnings = driverProfile.totalEarnings + deliveryFee;
      order.status = "Delivered";
      order.deliveredAt = new Date();
      await driverProfile.save();
      await order.save();
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  },
);

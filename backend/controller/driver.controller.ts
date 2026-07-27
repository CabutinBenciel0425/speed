import { asyncHandler } from "../utils/asyncHandler.js";
import type { Request, Response } from "express";
import { NotFoundError } from "../utils/errors.js";
import type { DriverUpdateInput } from "../schemas/driver.schema.js";
import {
  acceptOrderService,
  deliveredOrderService,
  getDriverProfile,
  headingToMerchantService,
  pickUpOrderService,
  updateCurrentLocationService,
  updateDriverProfile,
} from "../services/driver.service.js";
import Order from "../models/order.model.js";

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    throw new NotFoundError("User");
  }

  const driverProfile = await getDriverProfile(user._id.toString());

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

    const driverProfile = await getDriverProfile(user._id.toString());

    driverProfile.isAvailable = !driverProfile.isAvailable;

    await driverProfile.save();

    res.status(200).json({
      success: true,
      data: driverProfile,
    });
  },
);

export const updateCurrentLocation = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    const { latitude, longitude } = req.body;
    if (!user) {
      throw new NotFoundError("User");
    }
    const driverCoords: [number, number] = [longitude, latitude];

    const updatedDriverProfile = await updateCurrentLocationService(
      user._id.toString(),
      driverCoords,
    );

    res.status(200).json({
      success: true,
      data: updatedDriverProfile,
    });
  },
);

// GET    /driver/orders/current
export const getCurrentOrder = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;

    if (!user) {
      throw new NotFoundError("User");
    }

    const driverProfile = await getDriverProfile(user._id.toString());

    const currentOrder = await Order.findOne({
      driver: driverProfile._id,
      status: { $in: ["Preparing", "ReadyForPickup", "PickedUp"] },
    })
      .populate<"user">("user")
      .populate<"merchant">("merchant");

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

    const driverProfile = await getDriverProfile(user._id.toString());

    const orderHistory = await Order.find({
      driver: driverProfile._id,
      status: {
        $in: ["Delivered", "Cancelled", "Rejected"],
      },
    })
      .populate<"user">("user")
      .populate<"merchant">("merchant");

    if (orderHistory.length === 0) {
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
  const orderId = req.params.orderId as string;

  if (!user) {
    throw new NotFoundError("User");
  }

  const order = await acceptOrderService(user._id.toString(), orderId);

  res.status(200).json({
    success: true,
    data: order,
  });
});

// PATCH /driver/order/:orderId/heading-to-merchant
export const headingToMerchant = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    const orderId = req.params.orderId as string;

    if (!user) {
      throw new NotFoundError("User");
    }

    const updatedOrder = await headingToMerchantService(
      user._id.toString(),
      orderId,
    );

    res.status(200).json({
      success: true,
      data: updatedOrder,
    });
  },
);

// PATCH  /driver/orders/:orderId/picked-up
export const pickUpOrder = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const orderId = req.params.orderId as string;

  if (!user) {
    throw new NotFoundError("User");
  }

  const updatedOrder = await pickUpOrderService(user._id.toString(), orderId);

  res.status(200).json({
    success: true,
    data: updatedOrder,
  });
});

// PATCH  /driver/orders/:orderId/delivered
export const deliveredOrder = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    const orderId = req.params.orderId as string;

    if (!user) {
      throw new NotFoundError("User");
    }

    const updatedOrder = await deliveredOrderService(
      user._id.toString(),
      orderId,
    );

    res.status(200).json({
      success: true,
      data: updatedOrder,
    });
  },
);

import { asyncHandler } from "../utils/asyncHandler.js";
import type { Request, Response } from "express";
import { ConflictError, NotFoundError } from "../utils/errors.js";
import type { DriverUpdateInput } from "../schemas/driver.schema.js";
import {
  deliveredOrderService,
  getDriverProfile,
  headingToMerchantService,
  pickUpOrderService,
  updateCurrentLocationService,
  updateDriverProfile,
} from "../services/driver.service.js";
import Order from "../models/order.model.js";
import Driver from "../models/driver.model.js";

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
    const isAvailable = req.body?.isAvailable;

    if (typeof isAvailable !== "boolean") {
      throw new ConflictError("isAvailable must be a boolean");
    }
    if (isAvailable && driverProfile.status !== "Operational") {
      throw new ConflictError("Only operational drivers can go online");
    }
    if (driverProfile.activeOrder) {
      throw new ConflictError(
        "Complete your active delivery before changing availability",
      );
    }
    if (!["Offline", "Available"].includes(driverProfile.workingStatus)) {
      throw new ConflictError(
        "Availability cannot change during an active delivery",
      );
    }

    driverProfile.isAvailable = isAvailable;
    driverProfile.workingStatus = isAvailable ? "Available" : "Offline";

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
    const { latitude, longitude, orderId } = req.body;
    if (!user) {
      throw new NotFoundError("User");
    }
    const driverCoords: [number, number] = [longitude, latitude];

    const updatedDriverProfile = await updateCurrentLocationService(
      user._id.toString(),
      driverCoords,
      orderId,
    );

    res.status(200).json({
      success: true,
      data: updatedDriverProfile,
    });
  },
);

export const getCurrentOrder = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;

    if (!user) {
      throw new NotFoundError("User");
    }

    const driverProfile = await getDriverProfile(user._id.toString());

    const currentOrder = await Order.findOne({
      driver: driverProfile._id,
      status: { $in: ["Pending", "Preparing", "ReadyForPickup", "PickedUp"] },
    })
      .populate("customer", "firstName lastName phoneNumber")
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

export const headingToMerchant = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    const orderId = req.params.orderId as string;

    console.log("DRIVER IS HEADING TO MERCHANT");

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

export const pickUpOrder = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const orderId = req.params.orderId as string;
  console.log("DRIVER ORDERID", orderId);
  if (!user) {
    throw new NotFoundError("User");
  }

  const updatedOrder = await pickUpOrderService(user._id.toString(), orderId);

  res.status(200).json({
    success: true,
    data: updatedOrder,
  });
});

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

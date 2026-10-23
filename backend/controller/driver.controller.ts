import { asyncHandler } from "../utils/asyncHandler.js";
import type { Request, Response } from "express";
import { ConflictError, NotFoundError } from "../utils/errors.js";
import type { DriverUpdateInput } from "../schemas/driver.schema.js";
import {
  deliveredOrderService,
  driverMatching,
  driverAcceptOffer,
  driverDeclinedOffer,
  getPendingDriverOffers,
  getDriverProfile,
  headingToMerchantService,
  pickUpOrderService,
  updateCurrentLocationService,
  updateDriverProfile,
} from "../services/driver.service.js";
import Order from "../models/order.model.js";
import Driver from "../models/driver.model.js";
import type { IOrder } from "../models/order.model.js";
import type { QueryFilter } from "mongoose";
import { buildQuery } from "../utils/buildQuery.js";
import { computeDistance } from "../services/delivery.service.js";

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

export const getPendingOffers = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new NotFoundError("User");
  const offers = await getPendingDriverOffers(req.user._id.toString());
  res.status(200).json({ success: true, data: offers });
});

export const acceptOffer = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new NotFoundError("User");
  const driver = await Driver.findOne({ user: req.user._id });
  if (!driver) throw new NotFoundError("Driver");
  await driverAcceptOffer(String(req.params.offerId), driver._id.toString());
  res.status(200).json({ success: true });
});

export const declineOffer = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new NotFoundError("User");
  const driver = await Driver.findOne({ user: req.user._id });
  if (!driver) throw new NotFoundError("Driver");
  await driverDeclinedOffer(String(req.params.offerId), driver._id.toString());
  res.status(200).json({ success: true });
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

    if (isAvailable) {
      const waitingOrders = await Order.find({
        driver: null,
        driverMatchingStatus: "NoDriverFound",
        status: { $in: ["Pending", "Preparing", "ReadyForPickup"] },
      })
        .select("_id")
        .limit(20);
      for (const order of waitingOrders) {
        void driverMatching(order._id.toString()).catch((error) =>
          console.error("Driver matching after going online failed", error),
        );
      }
    }

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

export const getDriverOrderDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) throw new NotFoundError("User");

    const driverProfile = await getDriverProfile(user._id.toString());
    const order = await Order.findOne({
      _id: String(req.params.orderId),
      driver: driverProfile._id,
    })
      .populate("customer", "firstName lastName phoneNumber")
      .populate("merchant", "merchantName phoneNumber address")
      .populate({ path: "deliveryAddress.address", select: "instructions landmark" });

    if (!order) throw new NotFoundError("Order");

    const merchant = order.merchant as unknown as {
      address?: { location?: { coordinates?: number[] } };
    };
    const from = merchant?.address?.location?.coordinates;
    const to = order.deliveryAddress?.location?.coordinates;
    let deliveryDistanceKm: number | null = null;
    if (from?.length === 2 && to?.length === 2) {
      try {
        const route = await computeDistance(
          from as [number, number],
          to as [number, number],
        );
        deliveryDistanceKm = Math.round(route.distanceKm * 10) / 10;
      } catch (error) {
        console.warn("Could not calculate route distance for driver order", error);
      }
    }
    if (deliveryDistanceKm === null && from?.length === 2 && to?.length === 2) {
      const [lng1, lat1] = from.map((value) => (value * Math.PI) / 180) as [number, number];
      const [lng2, lat2] = to.map((value) => (value * Math.PI) / 180) as [number, number];
      const dLat = lat2 - lat1;
      const dLng = lng2 - lng1;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
      deliveryDistanceKm =
        Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) /
        10;
    }

    res.status(200).json({
      success: true,
      data: { ...order.toObject(), deliveryDistanceKm },
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

    const query = buildQuery(req.query);
    const filter: QueryFilter<IOrder> = {
      driver: driverProfile._id,
      status: {
        $in: ["Delivered", "Cancelled", "Rejected"],
      },
    };
    const [orderHistory, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(query.skip)
        .limit(query.limit)
        .populate("customer", "firstName lastName phoneNumber")
        .populate("merchant", "merchantName address"),
      Order.countDocuments(filter),
    ]);

    if (orderHistory.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No order yet",
        pagination: {
          total,
          page: query.page,
          limit: query.limit,
          pages: Math.ceil(total / query.limit),
        },
      });
    }

    res.status(200).json({
      success: true,
      data: orderHistory,
      pagination: {
        total,
        page: query.page,
        limit: query.limit,
        pages: Math.ceil(total / query.limit),
      },
    });
  },
);

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

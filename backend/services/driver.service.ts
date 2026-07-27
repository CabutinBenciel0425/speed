import mongoose, { type QueryFilter } from "mongoose";
import cloudinary from "../config/cloudinary.js";
import { DEFAULT_DRIVER_AVATAR } from "../config/constants.js";
import Driver from "../models/driver.model.js";
import type { IOrder } from "../models/order.model.js";
import User from "../models/user.model.js";
import type { UpdateDriverInputWithImage } from "../types/types.js";
import { NotFoundError } from "../utils/errors.js";
import { extractPublicIdFromUrl } from "../utils/extractPublicIdFromUrl.js";
import { imageUpload } from "../utils/imageUpload.js";
import Order from "../models/order.model.js";

export const updateDriverProfile = async (
  { vehicleType, plateNumber, avatar }: UpdateDriverInputWithImage,
  userId: string,
) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new NotFoundError("User");
  }

  const driverProfile = await getDriverProfile(user._id.toString());

  if (avatar) {
    if (
      driverProfile.avatar &&
      driverProfile.avatar !== DEFAULT_DRIVER_AVATAR
    ) {
      const publicId = extractPublicIdFromUrl(driverProfile.avatar);
      if (publicId) {
        const result = await cloudinary.uploader.destroy(publicId);
        if (result.result !== "ok") {
          console.warn(
            `Cloudinary cleanup failed for ${publicId}: ${result.result}`,
          );
        }
      }
    }
    const cloudinaryImageUrl = await imageUpload(avatar, "driver");

    driverProfile.avatar = cloudinaryImageUrl;
  }

  if (vehicleType) {
    driverProfile.vehicleType = vehicleType;
  }
  if (plateNumber) {
    driverProfile.plateNumber = plateNumber;
  }

  await driverProfile.save();

  return driverProfile;
};

export const updateCurrentLocationService = async (
  userId: string,
  driverCoords: [number, number],
) => {
  const driverProfile = await getDriverProfile(userId);

  driverProfile.currentLocation = {
    type: "Point",
    coordinates: driverCoords,
  };

  await driverProfile.save();

  return driverProfile;
};

export const acceptOrderService = async (userId: string, orderId: string) => {
  const session = await mongoose.startSession();
  const driver = await Driver.findOne({
    user: userId,
  });

  const order = await Order.findById(orderId);

  if (!driver) {
    throw new NotFoundError("Driver");
  }

  if (!order) {
    throw new NotFoundError("Order");
  }

  try {
    await session.withTransaction(async () => {
      order.driver = driver._id;
      order.driverAssignedAt = new Date();
      order.merchantReceivedAt = new Date();
      order.acceptedAt = new Date();
      driver.activeOrder = order._id;
      driver.workingStatus = "Assigned";
      driver.isAvailable = false;

      await driver.save({ session });
      await order.save({ session });
    });
  } catch (error) {
    throw Error("Error in accepting order");
  } finally {
    await session.endSession();
  }
};

export const headingToMerchantService = async (
  userId: string,
  orderId: string,
) => {
  const driverProfile = await getDriverProfile(userId);

  const order = await Order.findOne({
    driver: driverProfile._id,
    _id: orderId,
  } as QueryFilter<IOrder>)
    .populate<"user">("user")
    .populate<"merchant">("merchant");

  if (!order) {
    throw new NotFoundError("Order");
  }

  const activeOrderId = driverProfile.activeOrder?.toString();
  const isPaymentValid = isOrderPaymentValid(order);

  if (
    driverProfile.status === "Operational" &&
    driverProfile.workingStatus === "Assigned" &&
    activeOrderId === order._id.toString() &&
    order.driver?.toString() === driverProfile._id.toString() &&
    (order.status === "Preparing" || order.status === "ReadyForPickup") &&
    isPaymentValid
  ) {
    driverProfile.workingStatus = "HeadingToMerchant";
    await driverProfile.save();
  }

  return order;
};

export const pickUpOrderService = async (userId: string, orderId: string) => {
  const driverProfile = await getDriverProfile(userId);

  const order = await Order.findOne({
    driver: driverProfile._id,
    _id: orderId,
  } as QueryFilter<IOrder>)
    .populate<"user">("user")
    .populate<"merchant">("merchant");

  if (!order) {
    throw new NotFoundError("Order");
  }

  const activeOrderId = driverProfile.activeOrder?.toString();
  const isPaymentValid = isOrderPaymentValid(order);

  if (
    driverProfile.status === "Operational" &&
    driverProfile.workingStatus === "HeadingToMerchant" &&
    activeOrderId === order._id.toString() &&
    order.driver?.toString() === driverProfile._id.toString() &&
    order.status === "ReadyForPickup" &&
    isPaymentValid
  ) {
    driverProfile.workingStatus = "Delivering";
    order.status = "PickedUp";
    order.pickedUpAt = new Date();
    driverProfile.workingStatus = "Delivering";
    await driverProfile.save();
    await order.save();
  }

  return order;
};

export const deliveredOrderService = async (
  userId: string,
  orderId: string,
) => {
  const driverProfile = await getDriverProfile(userId);

  const order = await Order.findOne({
    driver: driverProfile._id,
    _id: orderId,
  } as QueryFilter<IOrder>)
    .populate<"user">("user")
    .populate<"merchant">("merchant");

  if (!order) {
    throw new NotFoundError("Order");
  }

  const activeOrderId = driverProfile.activeOrder?.toString();
  const deliveryFee = order.pricing?.deliveryFee || 0;
  const isPaymentValid = isOrderPaymentValid(order);

  if (
    driverProfile.status === "Operational" &&
    driverProfile.workingStatus === "Delivering" &&
    activeOrderId === order._id.toString() &&
    order.driver?.toString() === driverProfile._id.toString() &&
    order.status === "PickedUp" &&
    isPaymentValid
  ) {
    driverProfile.workingStatus = "Available";
    driverProfile.completedDeliveries += 1;
    driverProfile.totalEarnings = driverProfile.totalEarnings + deliveryFee;
    driverProfile.activeOrder = null;
    driverProfile.isAvailable = false;
    order.status = "Delivered";
    order.deliveredAt = new Date();
    await driverProfile.save();
    await order.save();
  }

  return order;
};

export const getDriverProfile = async (userId: string) => {
  const driver = await Driver.findOne({ user: userId }).populate<"user">(
    "user",
  );

  if (!driver) {
    throw new NotFoundError("Driver");
  }

  return driver;
};

export const isOrderPaymentValid = (order: IOrder) => {
  if (order.payment.method === "Cash" && order.payment.status === "Pending") {
    return true;
  }

  return order.payment.status === "Paid" && !!order.payment.transactionId;
};

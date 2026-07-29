import mongoose, { type QueryFilter } from "mongoose";
import cloudinary from "../config/cloudinary.js";
import { DEFAULT_DRIVER_AVATAR } from "../config/constants.js";
import Driver, { type IDriver } from "../models/driver.model.js";
import type { IOrder } from "../models/order.model.js";
import User from "../models/user.model.js";
import type { UpdateDriverInputWithImage } from "../types/types.js";
import { ConflictError, NotFoundError } from "../utils/errors.js";
import { extractPublicIdFromUrl } from "../utils/extractPublicIdFromUrl.js";
import { imageUpload } from "../utils/imageUpload.js";
import Order from "../models/order.model.js";
import Merchant from "../models/merchant.model.js";
import DeliveryOffer from "../models/deliveryOffer.model.js";
import { io } from "../server.js";
import { computeDistance } from "./delivery.service.js";
import Address from "../models/address.model.js";
import { pendingOffers } from "../utils/offerWaiting.js";

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
  }).session(session);

  const order = await Order.findById(orderId).session(session);

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

export const driverMatching = async (orderId: string) => {
  const order = await Order.findById(orderId).populate("merchant");
  if (!order) {
    throw new NotFoundError("Order");
  }
  const merchant = await Merchant.findById(order.merchant);

  if (!merchant) {
    throw new NotFoundError("Merchant");
  }

  const merchantCoords = merchant.address.location.coordinates as [
    number,
    number,
  ];

  const drivers = await findNearestDrivers(merchantCoords);

  if (drivers.length === 0) {
    throw new NotFoundError("Drivers");
  }

  for (const driver of drivers) {
    const offer = await sendOffer(order._id.toString(), driver._id.toString());

    const result = await waitForOfferResult(offer._id.toString());

    if (result === "Accepted") {
      break;
    }
  }
};

export const findNearestDrivers = async (coordinates: [number, number]) => {
  return Driver.find({
    status: "Operational",
    isAvailable: true,
    workingStatus: "Available",

    currentLocation: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates,
        },

        $maxDistance: 5000,
      },
    },
  }).limit(10);
};

export const sendOffer = async (orderId: string, driverId: string) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new NotFoundError("Order");
  }

  const customer = await User.findById(order.customer);

  if (!customer) {
    throw new NotFoundError("Customer");
  }

  const customerAddress = await Address.findOne({
    user: customer._id,
    isDefault: true,
  });
  const merchant = await Merchant.findById(order.merchant);

  if (!customerAddress) {
    throw new NotFoundError("User Address");
  }

  if (!merchant) {
    throw new NotFoundError("Merchant");
  }

  const customerCoords = customerAddress.location.coordinates as [
    number,
    number,
  ];
  const merchantCoords = merchant.address.location.coordinates as [
    number,
    number,
  ];

  const distance = await computeDistance(customerCoords, merchantCoords);

  const offer = new DeliveryOffer({
    order: orderId,
    driver: driverId,
    status: "Pending",
    expiresAt: new Date(Date.now() + 15000),
  });

  await offer.save();

  io.to(`driver:${driverId}`).emit("delivery:offer", {
    offerId: offer._id,
    merchant: order.merchant,
    merchantName: merchant.merchantName,
    merchantAddress: merchant.address,
    customer: order.customer,
    customerAddress: customerAddress,
    deliveryFee: order.pricing.deliveryFee,
    estimatedDistance: distance.distanceKm,
    estimatedDuration: order?.estimatedDeliveryTime,
  });
  return offer;
};

export const driverAcceptOffer = async (offerId: string, driverId: string) => {
  const session = await mongoose.startSession();

  const offer = await DeliveryOffer.findById(offerId);

  if (!offer) {
    throw new NotFoundError("Offer");
  }

  const driver = await Driver.findById(driverId);
  const order = await Order.findById(offer.order);

  if (!driver) {
    throw new NotFoundError("Driver");
  }

  if (!order) {
    throw new NotFoundError("Order");
  }

  if (offer.status !== "Pending")
    throw new ConflictError("Offer status must be 'Pending' first");

  if (offer.driver.toString() !== driver._id.toString()) {
    throw new ConflictError("Offer driver id is not equal to driver.id");
  }

  if (offer.order.toString() !== order._id.toString()) {
    throw new ConflictError("Offer's order id is not equal to order.id");
  }

  if (offer.expiresAt < new Date()) {
    throw new ConflictError("This offer is expired");
  }

  if (!driver.isAvailable) {
    throw new ConflictError("The driver is not available");
  }

  if (driver.status !== "Operational") {
    throw new ConflictError("Driver's status is not yet operational");
  }

  if (driver.activeOrder !== null) {
    throw new ConflictError("Driver still have an active order");
  }

  if (order.driver !== null) {
    throw new ConflictError("Order is assigned to another driver");
  }

  if (order.status !== "Pending") {
    throw new ConflictError("Order's status should be 'Pending' first");
  }

  if (order.payment.method !== "Cash" && order.payment.transactionId === null) {
    throw new ConflictError(
      "Order payment method is not cash but no transaction id found",
    );
  }

  try {
    await session.withTransaction(async () => {
      driver.workingStatus = "Assigned";
      driver.activeOrder = order._id;
      order.driver = driver._id;
      order.driverAssignedAt = new Date();
      order.acceptedAt = new Date();
      offer.status = "Accepted";
      order.status = "Preparing";
      order.merchantReceivedAt = new Date();

      await driver.save({ session });
      await order.save({ session });
      await offer.save({ session });
    });
  } finally {
    await session.endSession();
  }

  const resolve = pendingOffers.get(offerId);

  if (resolve) {
    pendingOffers.delete(offerId);

    resolve("Accepted");
  }

  io.to(`merchant:${order.merchant.toString()}`).emit("order:assigned");
  io.to(`customer:${order.customer.toString()}`).emit("order:assigned");
};

export const driverDeclinedOffer = async (offerId: string) => {
  const offer = await DeliveryOffer.findById(offerId);

  if (!offer) return;

  if (offer.status !== "Pending") return;

  if (offer.expiresAt < new Date()) return;

  offer.status = "Declined";

  await offer.save();

  const resolve = pendingOffers.get(offerId);

  if (resolve) {
    pendingOffers.delete(offerId);

    resolve("Declined");
  }
};

export const waitForOfferResult = (offerId: string) => {
  return new Promise<"Accepted" | "Declined" | "Expired">((resolve) => {
    pendingOffers.set(offerId, resolve);

    setTimeout(() => {
      if (pendingOffers.has(offerId)) {
        pendingOffers.delete(offerId);

        resolve("Expired");
      }
    }, 15000);
  });
};

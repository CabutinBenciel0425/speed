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
import Product from "../models/product.model.js";

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
  orderId: string,
) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new NotFoundError("Order");
  }

  const merchant = await Merchant.findById(order.merchant);

  if (!merchant) {
    throw new NotFoundError("Merchant");
  }

  const merchantCoords = merchant.address?.location?.coordinates as [
    number,
    number,
  ];

  if (!merchantCoords) {
    throw new NotFoundError("Merchant coordinates");
  }

  const driverProfile = await getDriverProfile(userId);

  driverProfile.currentLocation = {
    type: "Point",
    coordinates: driverCoords,
  };

  await driverProfile.save();

  const { distanceKm, durationMinutes } = await computeDistance(
    merchantCoords,
    driverCoords,
  );

  if (distanceKm < 0.05 || durationMinutes < 0.1) {
    await driverArrivedAtMerchant(userId, orderId);
  }

  io.to(`customer:${order.customer.toString()}`).emit(
    "driver:current-location",
  );

  return driverProfile;
};

// export const acceptOrderService = async (userId: string, orderId: string) => {
//   const session = await mongoose.startSession();
//   const driver = await Driver.findOne({
//     user: userId,
//   }).session(session);

//   const order = await Order.findById(orderId).session(session);

//   if (!driver) {
//     throw new NotFoundError("Driver");
//   }

//   if (!order) {
//     throw new NotFoundError("Order");
//   }

//   try {
//     await session.withTransaction(async () => {
//       order.driver = driver._id;
//       order.driverAssignedAt = new Date();
//       order.merchantReceivedAt = new Date();
//       order.acceptedAt = new Date();
//       driver.activeOrder = order._id;
//       driver.workingStatus = "Assigned";
//       driver.isAvailable = false;

//       await driver.save({ session });
//       await order.save({ session });
//     });
//   } finally {
//     await session.endSession();
//   }
// };

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

  const merchant = await Merchant.findById(order.merchant);

  if (!merchant) {
    throw new NotFoundError("Merchant");
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

  io.to(`customer:${userId}`).emit("driver:heading-to-merchant");
  io.to(`merchant:${merchant._id}`).emit("driver:heading-to-merchant");

  return order;
};

export const driverArrivedAtMerchant = async (
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
    driverProfile.workingStatus === "HeadingToMerchant" &&
    activeOrderId === order._id.toString() &&
    order.driver?.toString() === driverProfile._id.toString() &&
    (order.status === "Preparing" || order.status === "ReadyForPickup") &&
    isPaymentValid
  ) {
    driverProfile.workingStatus = "ArrivedAtMerchant";
    order.driverArrivedAtMerchantAt = new Date();
    await driverProfile.save();
  }

  io.to(`merchant:${order.merchant.toString()}`).emit(
    "driver:arrived-at-merchant",
  );
  io.to(`customer:${order.customer.toString()}`).emit(
    "driver:arrived-at-merchant",
  );

  return order;
};

export const pickUpOrderService = async (userId: string, orderId: string) => {
  const session = await mongoose.startSession();
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

  const merchant = await Merchant.findById(order.merchant);
  if (!merchant) {
    throw new NotFoundError("Merchant");
  }

  const activeOrderId = driverProfile.activeOrder?.toString();
  const isPaymentValid = isOrderPaymentValid(order);

  if (driverProfile.status !== "Operational") {
    throw new ConflictError("Driver is not in operational status yet");
  }

  if (driverProfile.workingStatus !== "HeadingToMerchant") {
    throw new ConflictError(
      "Driver cannot pick up the order unless driver status is heading to merchant or arrived at the merchant",
    );
  }

  if (activeOrderId !== order._id.toString()) {
    throw new ConflictError(
      "Drivers active order id is not equal to the order id",
    );
  }

  if (order.driver?.toString() !== driverProfile._id.toString()) {
    throw new ConflictError(
      "Order's driver id is not equal to the provided driver's id",
    );
  }

  if (order.status !== "ReadyForPickup") {
    throw new ConflictError("Order status must be ready to pick up");
  }

  if (!isPaymentValid) {
    throw new ConflictError("Payment is not valid");
  }

  try {
    await session.withTransaction(async () => {
      driverProfile.workingStatus = "Delivering";
      order.status = "PickedUp";
      order.pickedUpAt = new Date();
      await driverProfile.save({ session });
      await order.save({ session });
    });
  } finally {
    await session.endSession();
  }

  io.to(`customer:${order.customer.toString()}`).emit("order:pickedUp");
  io.to(`merchant:${merchant._id.toString}`).emit("order:pickedUp");

  return order;
};

export const deliveredOrderService = async (
  userId: string,
  orderId: string,
) => {
  const session = await mongoose.startSession();
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

  const merchant = await Merchant.findById(order.merchant);

  if (!merchant) {
    throw new NotFoundError("Merchant");
  }

  const activeOrderId = driverProfile.activeOrder?.toString();
  const deliveryFee = order.pricing?.deliveryFee || 0;
  const isPaymentValid = isOrderPaymentValid(order);

  if (driverProfile.status !== "Operational") {
    throw new ConflictError("Driver's status is not operational yet");
  }

  if (driverProfile.workingStatus !== "Delivering") {
    throw new ConflictError("Driver's working status must be 'Delivering'");
  }

  if (activeOrderId !== order._id.toString()) {
    throw new ConflictError("Driver's order id is not equal to the order's id");
  }

  if (order.driver?.toString() !== driverProfile._id.toString()) {
    throw new ConflictError(
      "Order's driver id is not equal to the provided driver's id",
    );
  }

  if (order.status !== "PickedUp") {
    throw new ConflictError("Order's status is not euqal to 'PickedUp' yet");
  }

  if (!isPaymentValid) {
    throw new ConflictError("Payment method is not valid");
  }

  try {
    await session.withTransaction(async () => {
      for (const item of order.items) {
        const product = await Product.findById(item.product).session(session);
        if (product) {
          product.totalSold += item.quantity;
          await product.save({ session });
        }
      }
      driverProfile.workingStatus = "Available";
      driverProfile.completedDeliveries += 1;
      driverProfile.totalEarnings = driverProfile.totalEarnings + deliveryFee;
      driverProfile.activeOrder = null;
      driverProfile.isAvailable = true;
      order.status = "Delivered";
      order.deliveredAt = new Date();
      merchant.completedOrders += 1;
      merchant.totalRevenue = merchant.totalRevenue + order.pricing.subtotal;

      await driverProfile.save({ session });
      await order.save({ session });
    });
  } finally {
    await session.endSession();
  }

  io.to(`customer:${order.customer.toString()}`).emit("order:delivered");

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
  const isOrderPending = ["Pending", "NoDriverFound"].includes(order.status);

  if (!isOrderPending || order.driver) {
    throw new ConflictError("Driver already assigned");
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
    order.status = "NoDriverFound";
    await order.save();

    io.to(`customer:${order.customer.toString()}`).emit("order:noDriverFound");

    return;
  }

  let driverAccepted = false;

  for (const driver of drivers) {
    const offer = await sendOffer(order._id.toString(), driver._id.toString());

    if (!offer) {
      continue;
    }

    const result = await waitForOfferResult(offer._id.toString());

    if (result === "Accepted") {
      driverAccepted = true;
      break;
    }

    if (result === "Expired") {
      offer.status = "Expired";

      await offer.save();
    }
  }
  if (!driverAccepted) {
    order.status = "NoDriverFound";
    await order.save();

    io.to(`customer:${order.customer.toString()}`).emit("order:noDriverFound");
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

  const driverSockets = await io.to(`driver:${driverId}`).fetchSockets();
  if (driverSockets.length === 0) {
    return null;
  }
  driverSockets.forEach((s) =>
    s.emit("delivery:offer", {
      offerId: offer._id,
      merchant: order.merchant,
      merchantName: merchant.merchantName,
      merchantAddress: merchant.address,
      customer: order.customer,
      customerAddress: customerAddress,
      deliveryFee: order.pricing.deliveryFee,
      estimatedDistance: distance.distanceKm,
      estimatedDuration: order?.estimatedDeliveryTime,
    }),
  );
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
      driver.isAvailable = false;
      order.driver = driver._id;
      order.driverAssignedAt = new Date();
      order.acceptedAt = new Date();
      offer.status = "Accepted";

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

  const expiredOffers = await DeliveryOffer.find({
    order: order._id,
    _id: { $ne: offer._id },
    status: "Pending",
  });

  await DeliveryOffer.updateMany(
    {
      order: order._id,
      _id: { $ne: offer._id },
      status: "Pending",
    },
    {
      status: "Expired",
    },
  );

  for (const expiredOffer of expiredOffers) {
    io.to(`driver:${expiredOffer.driver}`).emit("delivery:expired", {
      offerId: expiredOffer._id,
    });
  }

  io.to(`merchant:${order.merchant.toString()}`).emit("order:new");
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

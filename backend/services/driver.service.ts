import mongoose, { type QueryFilter, Types } from "mongoose";
import cloudinary from "../config/cloudinary.js";
import { DEFAULT_DRIVER_AVATAR } from "../config/constants.js";
import Driver from "../models/driver.model.js";
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
import { createNotification } from "./notification.service.js";
import type { CreateNotificationInput } from "../models/notification.model.js";

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
  orderId?: string,
) => {
  const driverProfile = await getDriverProfile(userId);
  if (
    !Array.isArray(driverCoords) ||
    driverCoords.length !== 2 ||
    !Number.isFinite(driverCoords[0]) ||
    !Number.isFinite(driverCoords[1]) ||
    Math.abs(driverCoords[0]) > 180 ||
    Math.abs(driverCoords[1]) > 90
  ) {
    throw new ConflictError("A valid longitude and latitude are required");
  }

  const order = orderId ? await Order.findById(orderId) : null;
  if (orderId && !order) throw new NotFoundError("Order");
  if (order && order.driver?.toString() !== driverProfile._id.toString()) {
    throw new ConflictError("This order is not assigned to the driver");
  }

  const merchant = order ? await Merchant.findById(order.merchant) : null;
  if (order && !merchant) throw new NotFoundError("Merchant");
  const merchantCoords = merchant?.address?.location?.coordinates as
    | [number, number]
    | undefined;
  if (order && !merchantCoords) throw new NotFoundError("Merchant coordinates");

  driverProfile.currentLocation = {
    type: "Point",
    coordinates: driverCoords,
  };

  console.log(driverCoords, merchantCoords);

  await driverProfile.save();

  if (!order || !merchantCoords) return driverProfile;

  if (order.status === "PickedUp") {
    io.to(`customer:${order.customer.toString()}`).emit(
      "driver:current-location",
      {
        orderId: order._id.toString(),
        coordinates: driverCoords,
      },
    );
  } else {
    const { distanceKm, durationMinutes } = await computeDistance(
      merchantCoords,
      driverCoords,
    );
    if (distanceKm < 0.05 || durationMinutes < 0.1) {
      await driverArrivedAtMerchant(userId, orderId!);
    }
  }

  return driverProfile;
};

export const headingToMerchantService = async (
  userId: string,
  orderId: string,
) => {
  console.log("[HEADING] Service entered", { userId, orderId });

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      console.log("[HEADING] Transaction started");

      const driverProfile = await getDriverProfile(userId, session);
      console.log("[HEADING] Driver profile loaded", {
        driverProfileId: driverProfile._id.toString(),
        status: driverProfile.status,
        workingStatus: driverProfile.workingStatus,
        activeOrder: driverProfile.activeOrder?.toString(),
      });

      const order = await Order.findOne({
        driver: driverProfile._id,
        _id: orderId,
      }).session(session);

      console.log("[HEADING] Order query completed", {
        found: Boolean(order),
      });

      if (!order) {
        throw new NotFoundError("Order");
      }

      const activeOrderId = driverProfile.activeOrder?.toString();
      const isPaymentValid = isOrderPaymentValid(order);

      console.log("[HEADING] Validating transition", {
        driverStatus: driverProfile.status,
        workingStatus: driverProfile.workingStatus,
        activeOrder: driverProfile.activeOrder?.toString(),
        orderId: order._id.toString(),
        assignedDriver: order.driver?.toString(),
        orderStatus: order.status,
        isPaymentValid,
      });

      if (
        driverProfile.status !== "Operational" ||
        driverProfile.workingStatus !== "Assigned" ||
        activeOrderId !== order._id.toString() ||
        order.driver?.toString() !== driverProfile._id.toString() ||
        !["Preparing", "ReadyForPickup"].includes(order.status) ||
        !isPaymentValid
      ) {
        throw new ConflictError("This order is not ready for pickup yet");
      }

      driverProfile.workingStatus = "HeadingToMerchant";
      order.driverHeadingToMerchantAt = new Date();
      await Promise.all([
        driverProfile.save({ session }),
        order.save({ session }),
      ]);
      console.log("DRIVERPROFILE", driverProfile);
      console.log("ORDER", order);
      const notificationDataCustomer: CreateNotificationInput = {
        targetId: new Types.ObjectId(userId),
        targetType: "Customer",
        type: "DRIVER_ASSIGNED",
        title: "Driver heading to the store",
        message: "Your driver is heading to the store.",
        order: order._id,
        isRead: false,
      };

      await createNotification(notificationDataCustomer);

      io.to(`customer:${userId}`).emit("driver:heading-to-merchant");
    });
  } catch (error) {
    console.error("[HEADING] Service failed", error);
    throw error;
  } finally {
    await session.endSession();
  }
};

export const driverArrivedAtMerchant = async (
  userId: string,
  orderId: string,
) => {
  const driverProfile = await getDriverProfile(userId);
  console.log("DRIVER ARRIVED AT MERCHANT");

  const order = await Order.findOne({
    driver: driverProfile._id,
    _id: orderId,
  } as QueryFilter<IOrder>).populate<"merchant">("merchant");

  if (!order) {
    throw new NotFoundError("Order");
  }

  const activeOrderId = driverProfile.activeOrder?.toString();
  const isPaymentValid = isOrderPaymentValid(order);
  let arrivedNow = false;

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
    await order.save();
    arrivedNow = true;
  }

  if (arrivedNow) {
    await createNotification({
      targetId: order.merchant._id,
      targetType: "Merchant",
      type: "DRIVER_ARRIVED",
      title: "Driver arrived at your store",
      message: `The driver for order #${order.orderNumber} has arrived.`,
      order: order._id,
    });
  }

  io.to(`merchant:${order.merchant.toString()}`).emit(
    "driver:arrived-at-merchant",
  );
  io.to(`customer:${order.customer.toString()}`).emit(
    "driver:arrived-at-merchant",
  );
  if (order.driver) {
    io.to(`driver:${order.driver.toString()}`).emit(
      "driver:arrived-at-merchant",
    );
  }

  return order;
};

export const pickUpOrderService = async (
  userId: string,
  orderId: string,
): Promise<IOrder> => {
  const session = await mongoose.startSession();

  let order!: IOrder & { merchant: { _id: Types.ObjectId } };
  let merchantId!: string;

  try {
    await session.withTransaction(async () => {
      const driverProfile = await getDriverProfile(userId);

      const foundOrder = await Order.findOne(
        { driver: driverProfile._id, _id: orderId } as QueryFilter<IOrder>,
        null,
        { session },
      ).populate<"merchant">("merchant");

      if (!foundOrder) throw new NotFoundError("Order");
      order = foundOrder;
      if (!order.merchant) throw new NotFoundError("Merchant");

      const isPaymentValid = isOrderPaymentValid(order);

      if (driverProfile.status !== "Operational")
        throw new ConflictError("Driver is not in operational status yet");

      const allowed = ["HeadingToMerchant", "ArrivedAtMerchant"];
      if (!allowed.includes(driverProfile.workingStatus))
        throw new ConflictError(
          "Driver must be heading to or arrived at the merchant",
        );

      if (driverProfile.activeOrder?.toString() !== order._id.toString())
        throw new ConflictError(
          "Driver's active order does not match the order id",
        );

      if (order.status !== "ReadyForPickup")
        throw new ConflictError("Order status must be ready to pick up");

      if (!isPaymentValid) throw new ConflictError("Payment is not valid");

      driverProfile.workingStatus = "Delivering";
      order.status = "PickedUp";
      order.pickedUpAt = new Date();

      await driverProfile.save({ session });
      await order.save({ session });

      merchantId = order.merchant._id.toString();
    });
  } finally {
    await session.endSession();
  }

  try {
    await createNotification({
      targetId: order.merchant,
      targetType: "Merchant",
      type: "DRIVER_PICKED_UP",
      title: "Order picked up",
      message: `Order #${order.orderNumber} is on its way to the customer.`,
      order: order._id,
    });

    io.to(`customer:${order.customer.toString()}`).emit("order:pickedUp");
    io.to(`merchant:${merchantId}`).emit("order:pickedUp");
  } catch (err) {
    console.error("Post-pickup side effects failed", { orderId, err });
  }

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
  } as QueryFilter<IOrder>).populate<"merchant">("merchant");

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

  await createNotification({
    targetId: merchant._id,
    targetType: "Merchant",
    type: "ORDER_DELIVERED",
    title: "Order delivered",
    message: `Order #${order.orderNumber} was delivered successfully.`,
    order: order._id,
  });

  io.to(`customer:${order.customer.toString()}`).emit("order:delivered");

  return order;
};

export const getDriverProfile = async (
  userId: string,
  session?: mongoose.ClientSession,
) => {
  const query = Driver.findOne({ user: userId }).populate(
    "user",
    "firstName lastName email phoneNumber avatar",
  );
  const driver = await (session ? query.session(session) : query);

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
  const order = await Order.findById(orderId);
  if (!order) {
    throw new NotFoundError("Order");
  }
  const matchableStatuses = ["Pending", "Preparing", "ReadyForPickup"];
  if (!matchableStatuses.includes(order.status) || order.driver)
    throw new ConflictError("Order status is not valid");
  order.driverMatchingStatus = "Searching";
  await order.save();
  const merchant = await Merchant.findById(order.merchant);

  if (!merchant) {
    throw new NotFoundError("Merchant");
  }

  const merchantCoords = merchant.address.location.coordinates as [
    number,
    number,
  ];

  const drivers = await findNearestDrivers(merchantCoords);
  const activeOrder = await Order.findById(orderId);
  if (
    !activeOrder ||
    activeOrder.driver ||
    !matchableStatuses.includes(activeOrder.status)
  ) {
    return activeOrder;
  }

  if (drivers.length === 0) {
    activeOrder.driverMatchingStatus = "NoDriverFound";
    await activeOrder.save();
    io.to(`customer:${activeOrder.customer.toString()}`).emit(
      "order:noDriverFound",
    );

    return activeOrder;
  }

  let driverAccepted = false;

  for (const driver of drivers) {
    const offer = await sendOffer(order._id.toString(), driver._id.toString());

    if (!offer) {
      continue;
    }

    const result = await waitForOfferResult(offer._id.toString());
    const latestOrder = await Order.findById(orderId);
    if (
      !latestOrder ||
      latestOrder.driver ||
      !matchableStatuses.includes(latestOrder.status)
    ) {
      if (offer.status === "Pending") {
        offer.status = "Expired";
        await offer.save();
      }
      return latestOrder;
    }

    if (result === "Accepted" && latestOrder.driver) {
      driverAccepted = true;
      break;
    }

    if (result === "Expired") {
      offer.status = "Expired";

      await offer.save();
    }
  }
  if (!driverAccepted) {
    const latestOrder = await Order.findById(orderId);
    if (
      latestOrder &&
      !latestOrder.driver &&
      matchableStatuses.includes(latestOrder.status)
    ) {
      latestOrder.driverMatchingStatus = "NoDriverFound";
      await latestOrder.save();
      io.to(`customer:${latestOrder.customer.toString()}`).emit(
        "order:noDriverFound",
      );
    }
  }

  return await Order.findById(orderId);
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

  if (!["Pending", "Preparing", "ReadyForPickup"].includes(order.status)) {
    throw new ConflictError("Order is no longer available for delivery");
  }
  if (order.driverMatchingStatus === "NoDriverFound") {
    throw new ConflictError("This delivery offer has expired");
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
      order.driverMatchingStatus = "Assigned";
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

  await createNotification({
    targetId: order.customer,
    targetType: "Customer",
    type: "DRIVER_ASSIGNED",
    title: "Driver assigned",
    message:
      "A driver accepted your delivery and will pick up your order after the store prepares it.",
    order: order._id,
  });

  io.to(`customer:${order.customer.toString()}`).emit("order:assigned", {
    orderId: order._id.toString(),
  });
};

export const driverDeclinedOffer = async (
  offerId: string,
  driverId: string,
) => {
  const offer = await DeliveryOffer.findById(offerId);

  if (!offer) return;

  if (offer.driver.toString() !== driverId) {
    throw new ConflictError("Offer does not belong to this driver");
  }

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

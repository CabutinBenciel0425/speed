import type { QueryFilter } from "mongoose";
import type {
  CreateNotificationInput,
  INotification,
} from "../models/notification.model.js";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import { ConflictError } from "../utils/errors.js";
import mongoose from "mongoose";
import { io } from "../server.js";

type NotificationTargetType = CreateNotificationInput["targetType"];

export const notifyAdmins = async ({
  type,
  title,
  message,
  order = null,
}: Pick<CreateNotificationInput, "type" | "title" | "message" | "order">) => {
  if (!type.startsWith("ADMIN_")) return;
  try {
    const admins = await User.find({ role: "Admin" }).select("_id").lean();
    await Promise.allSettled(
      admins.map(async (admin) => {
        const notification = await createNotification({
          targetId: admin._id,
          targetType: "Admin",
          type,
          title,
          message,
          order,
        });
        io.to(`admin:${admin._id.toString()}`).emit(
          "notification:new",
          notification,
        );
      }),
    );
  } catch (error) {
    console.error("Could not create admin notifications", error);
  }
};

export const createNotification = async ({
  targetId,
  targetType,
  type,
  title,
  message,
  order = null,
  isRead = false,
}: CreateNotificationInput) => {
  const customerTypes = [
    "PAYMENT_SUCCESS",
    "PAYMENT_FAILED",
    "PAYMENT_EXPIRED",
    "ORDER_ACCEPTED",
    "ORDER_REJECTED",
    "DRIVER_ASSIGNED",
    "DRIVER_ARRIVED",
    "ORDER_DELIVERED",
    "ORDER_CANCELLED",
    "NO_DRIVER_FOUND",
  ];
  const merchantTypes = [
    "NEW_ORDER",
    "ORDER_CANCELLED",
    "DRIVER_ASSIGNED",
    "DRIVER_ARRIVED",
    "DRIVER_PICKED_UP",
    "ORDER_DELIVERED",
    "NO_DRIVER_FOUND",
  ];
  const driverTypes = [
    "NEW_DELIVERY_OFFER",
    "ORDER_CANCELLED",
    "ORDER_REJECTED",
  ];
  const adminTypes = [
    "ADMIN_NEW_ORDER",
    "ADMIN_NEW_MERCHANT",
    "ADMIN_NEW_DRIVER",
    "ADMIN_NEW_REVIEW",
  ];

  if (targetType === "Customer" && !customerTypes.includes(type)) {
    throw new ConflictError(
      `Provided type is not included in the customer's type`,
    );
  }

  if (targetType === "Merchant" && !merchantTypes.includes(type)) {
    throw new ConflictError(
      `Provided type is not included in the merchant's type`,
    );
  }

  if (targetType === "Driver" && !driverTypes.includes(type)) {
    throw new ConflictError(
      `Provided type is not included in the driver's type`,
    );
  }
  if (targetType === "Admin" && !adminTypes.includes(type)) {
    throw new ConflictError(
      "Provided type is not included in the admin's type",
    );
  }

  const newNotification = await Notification.create({
    targetId,
    targetType,
    type,
    title,
    message,
    order,
    isRead,
  });

  return newNotification;
};

export const getNotificationsService = async (
  id: string,
  targetType: NotificationTargetType,
) => {
  return await Notification.find({
    targetId: id,
    targetType,
  } as QueryFilter<INotification>)
    .sort({ createdAt: -1 })
    .limit(100);
};

export const getUnreadNotificationCountService = async (
  id: string,
  targetType: NotificationTargetType,
) =>
  Notification.countDocuments({
    targetId: id,
    targetType,
    isRead: false,
  } as QueryFilter<INotification>);

export const getNotificationService = async (
  notificationId: string,
  id: string,
  targetType: NotificationTargetType,
) => {
  return await Notification.findOne({
    _id: notificationId,
    targetId: id,
    targetType,
  } as QueryFilter<INotification>);
};

export const readNotificationService = async (
  notificationId: string,
  id: string,
  targetType: NotificationTargetType,
) => {
  return await Notification.findOneAndUpdate(
    {
      _id: notificationId,
      targetId: id,
      targetType,
    } as QueryFilter<INotification>,
    { isRead: true },
    { new: true, runValidators: true },
  );
};

export const readAllNotificationService = async (
  id: string,
  targetType: NotificationTargetType,
) => {
  return await Notification.updateMany(
    {
      targetId: new mongoose.Types.ObjectId(id),
      targetType,
    } as QueryFilter<INotification>,
    { isRead: true },
    { runValidators: true },
  );
};

export const deleteNotificationService = async (
  notificationId: string,
  id: string,
  targetType: NotificationTargetType,
) => {
  return await Notification.findOneAndDelete({
    _id: notificationId,
    targetId: new mongoose.Types.ObjectId(id),
    targetType,
  } as QueryFilter<INotification>);
};

export const deleteAllNotificationService = async (
  id: string,
  targetType: NotificationTargetType,
) => {
  return await Notification.deleteMany({
    targetId: new mongoose.Types.ObjectId(id),
    targetType,
  } as QueryFilter<INotification>);
};

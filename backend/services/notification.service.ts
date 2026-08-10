import type { QueryFilter } from "mongoose";
import type {
  CreateNotificationInput,
  INotification,
} from "../models/notification.model.js";
import Notification from "../models/notification.model.js";
import { ConflictError } from "../utils/errors.js";
import type { ValidUserRoleInput } from "../schemas/user.schema.js";
import mongoose from "mongoose";

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
    "DRIVER_PICKED_UP",
  ];
  const driverTypes = ["NEW_DELIVERY_OFFER", "ORDER_CANCELLED"];

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
  targetType: string,
) => {
  return await Notification.find({
    targetId: id,
    targetType,
  } as QueryFilter<INotification>);
};

export const getNotificationService = async (
  notificationId: string,
  id: string,
  targetType: ValidUserRoleInput,
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
  targetType: ValidUserRoleInput,
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
  targetType: ValidUserRoleInput,
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
  targetType: ValidUserRoleInput,
) => {
  return await Notification.findOneAndDelete({
    _id: notificationId,
    targetId: new mongoose.Types.ObjectId(id),
    targetType,
  } as QueryFilter<INotification>);
};

export const deleteAllNotificationService = async (
  id: string,
  targetType: ValidUserRoleInput,
) => {
  return await Notification.deleteMany({
    targetId: new mongoose.Types.ObjectId(id),
    targetType,
  } as QueryFilter<INotification>);
};

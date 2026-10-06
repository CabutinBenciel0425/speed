import { asyncHandler } from "../utils/asyncHandler.js";
import type { Request, Response } from "express";
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/errors.js";
import {
  deleteAllNotificationService,
  deleteNotificationService,
  getNotificationService,
  getNotificationsService,
  readAllNotificationService,
  readNotificationService,
} from "../services/notification.service.js";
import Merchant from "../models/merchant.model.js";
import Driver from "../models/driver.model.js";
import type { CreateNotificationInput } from "../models/notification.model.js";
import { getUnreadNotificationCountService } from "../services/notification.service.js";

const resolveNotificationTarget = async (req: Request) => {
  const user = req.user;
  const role = req.userRole;
  if (!user || !role) throw new UnauthorizedError("Unauthorized user");

  let id: string;
  if (role === "Customer") {
    id = user._id.toString();
  } else if (role === "Merchant") {
    const merchant = await Merchant.findOne({ owner: user._id }).select("_id");
    if (!merchant) throw new NotFoundError("Merchant");
    id = merchant._id.toString();
  } else if (role === "Driver") {
    const driver = await Driver.findOne({ user: user._id }).select("_id");
    if (!driver) throw new NotFoundError("Driver");
    id = driver._id.toString();
  } else {
    throw new UnauthorizedError("Notifications are not available for this role");
  }

  const requestedId = req.params.id;
  if (requestedId && requestedId !== id) {
    throw new UnauthorizedError("Cannot access another user's notifications");
  }

  return { id, role: role as CreateNotificationInput["targetType"] };
};

export const getNotifications = asyncHandler(
  async (req: Request, res: Response) => {
    const { id, role } = await resolveNotificationTarget(req);
    const notifications = await getNotificationsService(id, role);
    const unreadCount = await getUnreadNotificationCountService(id, role);

    res.status(200).json({
      success: true,
      data: req.params.id ? notifications : { notifications, unreadCount },
    });
  },
);

export const getUnreadNotificationCount = asyncHandler(
  async (req: Request, res: Response) => {
    const { id, role } = await resolveNotificationTarget(req);
    const unreadCount = await getUnreadNotificationCountService(id, role);
    res.status(200).json({ success: true, data: { unreadCount } });
  },
);

export const getNotification = asyncHandler(
  async (req: Request, res: Response) => {
    const { id, role } = await resolveNotificationTarget(req);
    const notificationId = req.params.notificationId as string;

    const notification = await getNotificationService(notificationId, id, role);
    if (!notification) throw new NotFoundError("Notification");

    res.status(200).json({
      success: true,
      data: notification,
    });
  },
);

export const readNotification = asyncHandler(
  async (req: Request, res: Response) => {
    const { id, role } = await resolveNotificationTarget(req);
    const notificationId = req.params.notificationId as string;

    const notification = await readNotificationService(
      notificationId,
      id,
      role,
    );

    res.status(200).json({
      success: true,
      data: notification,
    });
  },
);

export const readAllNotifications = asyncHandler(
  async (req: Request, res: Response) => {
    const { id, role } = await resolveNotificationTarget(req);

    const notifications = await readAllNotificationService(id, role);

    if (!notifications.acknowledged) {
      throw new ConflictError(
        "There was an error updating all the notifications",
      );
    }

    res.status(200).json({
      success: true,
      data: notifications,
    });
  },
);

export const deleteNotification = asyncHandler(
  async (req: Request, res: Response) => {
    const { id, role } = await resolveNotificationTarget(req);
    const notificationId = req.params.notificationId as string;

    const notification = await deleteNotificationService(
      notificationId,
      id,
      role,
    );

    if (!notification) {
      throw new NotFoundError("Notification");
    }

    res.status(200).json({
      success: true,
      message: "Notification successfully deleted",
    });
  },
);

export const deleteNotifications = asyncHandler(
  async (req: Request, res: Response) => {
    const { id, role } = await resolveNotificationTarget(req);

    const { acknowledged } = await deleteAllNotificationService(id, role);

    if (!acknowledged) {
      throw new ConflictError(
        "There was an error on clearing the notifications",
      );
    }

    res.status(200).json({
      success: true,
      message: "Notifications successfully cleared",
    });
  },
);

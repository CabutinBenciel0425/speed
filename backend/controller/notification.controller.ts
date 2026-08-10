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
import type { ValidUserRoleInput } from "../schemas/user.schema.js";

export const getNotifications = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    const id = req.params.id as string;
    const role: ValidUserRoleInput | undefined = req.userRole;

    if (!user || !role) {
      throw new UnauthorizedError("Unauthorized user");
    }

    const notifications = await getNotificationsService(id, role);

    res.json({
      success: true,
      data: notifications,
    });
  },
);

export const getNotification = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    const id = req.params.id as string;
    const notificationId = req.params.notificationId as string;
    const role: ValidUserRoleInput | undefined = req.userRole;

    if (!user || !role) {
      throw new UnauthorizedError("Unauthorized user");
    }

    const notification = await getNotificationService(notificationId, id, role);

    res.json({
      success: true,
      data: notification,
    });
  },
);

export const readNotification = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    const id = req.params.id as string;
    const notificationId = req.params.notificationId as string;
    const role: ValidUserRoleInput | undefined = req.userRole;

    if (!user || !role) {
      throw new UnauthorizedError("Unauthorized user");
    }

    const notification = await readNotificationService(
      notificationId,
      id,
      role,
    );

    res.json({
      success: true,
      data: notification,
    });
  },
);

export const readAllNotifications = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    const id = req.params.id as string;
    const role: ValidUserRoleInput | undefined = req.userRole;

    if (!user || !role) {
      throw new UnauthorizedError("Unauthorized user");
    }

    const notifications = await readAllNotificationService(id, role);

    if (!notifications.acknowledged || notifications.modifiedCount === 0) {
      throw new ConflictError(
        "There was an error updating all the notifications",
      );
    }

    res.json({
      success: true,
      data: notifications,
    });
  },
);

export const deleteNotification = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    const id = req.params.id as string;
    const notificationId = req.params.notificationId as string;
    const role: ValidUserRoleInput | undefined = req.userRole;

    if (!user || !role) {
      throw new UnauthorizedError("Unauthorized user");
    }

    const notification = await deleteNotificationService(
      notificationId,
      id,
      role,
    );

    if (!notification) {
      throw new NotFoundError("Notification");
    }

    res.json({
      success: true,
      message: "Notification successfully deleted",
    });
  },
);

export const deleteNotifications = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    const id = req.params.id as string;
    const role: ValidUserRoleInput | undefined = req.userRole;

    if (!user || !role) {
      throw new UnauthorizedError("Unauthorized user");
    }

    const { acknowledged } = await deleteAllNotificationService(id, role);

    if (!acknowledged) {
      throw new ConflictError(
        "There was an error on clearing the notifications",
      );
    }

    res.json({
      success: true,
      message: "Notifications successfully cleared",
    });
  },
);

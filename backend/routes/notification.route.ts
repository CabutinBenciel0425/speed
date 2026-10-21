import { Router } from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
  deleteNotification,
  deleteNotifications,
  getNotification,
  getNotifications,
  getUnreadNotificationCount,
  readAllNotifications,
  readNotification,
} from "../controller/notification.controller.js";

const notificationRouter = Router();

notificationRouter.get("/me", protectRoute, getNotifications);
notificationRouter.get(
  "/me/unread-count",
  protectRoute,
  getUnreadNotificationCount,
);
notificationRouter.patch("/me/read-all", protectRoute, readAllNotifications);
notificationRouter.delete("/me", protectRoute, deleteNotifications);
notificationRouter.patch(
  "/me/:notificationId/read",
  protectRoute,
  readNotification,
);
notificationRouter.delete(
  "/me/:notificationId",
  protectRoute,
  deleteNotification,
);

notificationRouter.get("/:id", protectRoute, getNotifications);

notificationRouter.get("/:notificationId/:id", protectRoute, getNotification);

notificationRouter.patch(
  "/:notificationId/:id/read",
  protectRoute,
  readNotification,
);

notificationRouter.patch("/:id/read-all", protectRoute, readAllNotifications);

notificationRouter.delete(
  "/:notificationId/:id",
  protectRoute,
  deleteNotification,
);

notificationRouter.delete("/:id", protectRoute, deleteNotifications);

export default notificationRouter;

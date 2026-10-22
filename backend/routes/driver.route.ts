import { validate } from "../middlewares/validate.middleware.js";
import { Router } from "express";
import {
  adminOnly,
  driverOnly,
  protectRoute,
} from "../middlewares/auth.middleware.js";
import {
  deliveredOrder,
  getCurrentOrder,
  getDriverOrderDetails,
  getOrderHistory,
  getProfile,
  headingToMerchant,
  pickUpOrder,
  toggleDriverAvailability,
  updateCurrentLocation,
  updateProfile,
} from "../controller/driver.controller.js";
import { updateDriverSchema } from "../schemas/driver.schema.js";

const driverRouter = Router();

driverRouter.get("/", protectRoute, driverOnly, getProfile);
driverRouter.patch(
  "/",
  protectRoute,
  driverOnly,
  validate(updateDriverSchema),
  updateProfile,
);
driverRouter.patch(
  "/availability",
  protectRoute,
  driverOnly,
  toggleDriverAvailability,
);
driverRouter.patch(
  "/location",
  protectRoute,
  driverOnly,
  updateCurrentLocation,
);

driverRouter.get("/orders/current", protectRoute, driverOnly, getCurrentOrder);
driverRouter.get("/orders/history", protectRoute, driverOnly, getOrderHistory);
driverRouter.get("/orders/:orderId", protectRoute, driverOnly, getDriverOrderDetails);

driverRouter.patch(
  "/orders/:orderId/heading-to-merchant",
  protectRoute,
  driverOnly,
  headingToMerchant,
);
driverRouter.patch(
  "/orders/:orderId/picked-up",
  protectRoute,
  driverOnly,
  pickUpOrder,
);

driverRouter.patch(
  "/orders/:orderId/delivered",
  protectRoute,
  driverOnly,
  deliveredOrder,
);

export default driverRouter;

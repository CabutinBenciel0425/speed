import { validate } from "../middlewares/validate.middleware.js";
import { Router } from "express";
import { driverOnly, protectRoute } from "../middlewares/auth.middleware.js";
import {
  acceptOrder,
  deliveredOrder,
  getCurrentOrder,
  getLocation,
  getOrderHistory,
  getProfile,
  headingToMerchant,
  pickUpOrder,
  toggleDriverAvailability,
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
driverRouter.patch("/location", protectRoute, driverOnly, getLocation);

driverRouter.get(
  "/driver/orders/current",
  protectRoute,
  driverOnly,
  getCurrentOrder,
);
driverRouter.get(
  "/driver/orders/history",
  protectRoute,
  driverOnly,
  getOrderHistory,
);
driverRouter.get(
  "/driver/orders/:orderId/accept",
  protectRoute,
  driverOnly,
  acceptOrder,
);
driverRouter.get(
  "/driver/order/:orderId/heading-to-merchant",
  protectRoute,
  driverOnly,
  headingToMerchant,
);
driverRouter.get(
  "/driver/orders/:orderId/picked-up",
  protectRoute,
  driverOnly,
  pickUpOrder,
);
driverRouter.get(
  "/driver/orders/:orderId/delivered",
  protectRoute,
  driverOnly,
  deliveredOrder,
);

export default driverRouter;

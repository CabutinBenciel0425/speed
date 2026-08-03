import { Router } from "express";
import { adminOnly, protectRoute } from "../middlewares/auth.middleware.js";
import {
  allMerchants,
  allUsers,
  deleteUser,
  merchantProfile,
  toggleMerchantStatus,
  userProfile,
  allDrivers,
  driverProfile,
  toggleDriverStatus,
} from "../controller/admin.controller.js";

const adminRouter = Router();

//user routes
adminRouter.get("/users", protectRoute, adminOnly, allUsers);
adminRouter.get("/users/:id", protectRoute, adminOnly, userProfile);
adminRouter.delete("/:id", protectRoute, adminOnly, deleteUser);

//merchant routes
adminRouter.get("/merchant", protectRoute, adminOnly, allMerchants);
adminRouter.get(
  "/merchant/:merchantId",
  protectRoute,
  adminOnly,
  merchantProfile,
);
adminRouter.patch(
  "/merchant/:merchantId/:status",
  protectRoute,
  adminOnly,
  toggleMerchantStatus,
);

//driver routes

adminRouter.get("/driver", protectRoute, adminOnly, allDrivers);
adminRouter.get("/driver/:driverId", protectRoute, adminOnly, driverProfile);
adminRouter.patch(
  "/driver/:driverId/:status",
  protectRoute,
  adminOnly,
  toggleDriverStatus,
);

export default adminRouter;

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
  allOrders,
  orderDetails,
  cancelOrder,
  allProducts,
  toggleProductAdmin,
  deleteProductAdmin,
  allReviews,
  reviewDetails,
  hideReview,
  getDashboardSummary,
  getRevenueAnalytics,
  getOrderAnalytics,
} from "../controller/admin.controller.js";

const adminRouter = Router();

//user routes
adminRouter.get("/users", protectRoute, adminOnly, allUsers);
adminRouter.get("/users/:id", protectRoute, adminOnly, userProfile);
adminRouter.delete("/users/:id", protectRoute, adminOnly, deleteUser);

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

//order routes
adminRouter.get("/order", protectRoute, adminOnly, allOrders);
adminRouter.get("/order/:orderId", protectRoute, adminOnly, orderDetails);
adminRouter.patch(
  "/order/:orderId/cancel",
  protectRoute,
  adminOnly,
  cancelOrder,
);

//product routes
adminRouter.get("/product", protectRoute, adminOnly, allProducts);
adminRouter.patch("/product/:productId/status", protectRoute, adminOnly, toggleProductAdmin);
adminRouter.delete("/product/:productId", protectRoute, adminOnly, deleteProductAdmin);

//reviews routes
adminRouter.get("/review", protectRoute, adminOnly, allReviews);
adminRouter.get("/review/:reviewId", protectRoute, adminOnly, reviewDetails);
adminRouter.patch(
  "/review/:reviewId/delete",
  protectRoute,
  adminOnly,
  hideReview,
);

//analytics routes
adminRouter.get(
  "/dashboard",
  protectRoute,
  adminOnly,
  getDashboardSummary,
);
adminRouter.get(
  "/analytics/revenue/:period",
  protectRoute,
  adminOnly,
  getRevenueAnalytics,
);
adminRouter.get("/analytics/orders", protectRoute, adminOnly, getOrderAnalytics);

export default adminRouter;

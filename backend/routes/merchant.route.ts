import { Router, type RequestHandler } from "express";
import { merchantOnly, protectRoute } from "../middlewares/auth.middleware.js";
import {
  getMerchantDetails,
  getMerchantAnalytics,
  getMerchantDashboard,
  getMerchantProducts,
  getMerchantProfile,
  getMerchants,
  updateMerchantProfile,
  toggleMerchantFavorite,
  getMerchantFavorites,
  getOrders,
  acceptOrder,
  rejectOrder,
  readyOrder,
  getMerchantFavoriteStatus,
  getMyMerchant,
  cancelMerchantOrder,
} from "../controller/merchant.controller.js";
import { upload } from "../middlewares/upload.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { merchantUpdateInput } from "../schemas/merchant.schema.js";

const merchantRouter = Router();

const authenticateMerchantProductRequest: RequestHandler = (req, res, next) => {
  if (req.params.requestType === "merchant") {
    return protectRoute(req, res, next);
  }
  next();
};

const authorizeMerchantProductRequest: RequestHandler = (req, res, next) => {
  if (req.params.requestType === "merchant") {
    return merchantOnly(req, res, next);
  }
  next();
};

//public routes
merchantRouter.get("/:merchantId/details", getMerchantDetails);
merchantRouter.get("/", getMerchants);
merchantRouter.get(
  "/:merchantId/:requestType/products",
  authenticateMerchantProductRequest,
  authorizeMerchantProductRequest,
  getMerchantProducts,
);

//customer routes
merchantRouter.post(
  "/favorites/:merchantId/status",
  protectRoute,
  toggleMerchantFavorite,
);
merchantRouter.get(
  "/favorites/:merchantId",
  protectRoute,
  getMerchantFavoriteStatus,
);
merchantRouter.get("/favorites", protectRoute, getMerchantFavorites);

//merchant routes
merchantRouter.get(
  "/dashboard",
  protectRoute,
  merchantOnly,
  getMerchantDashboard,
);
merchantRouter.get(
  "/analytics",
  protectRoute,
  merchantOnly,
  getMerchantAnalytics,
);
merchantRouter.get("/me", protectRoute, merchantOnly, getMyMerchant);
merchantRouter.get(
  "/:merchantId/profile",
  protectRoute,
  merchantOnly,
  getMerchantProfile,
);
merchantRouter.patch(
  "/:merchantId/profile",
  protectRoute,
  merchantOnly,
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  validate(merchantUpdateInput),
  updateMerchantProfile,
);

merchantRouter.get(
  "/:merchantId/orders",
  protectRoute,
  merchantOnly,
  getOrders,
);
merchantRouter.patch(
  "/:merchantId/orders/:orderId/accept",
  protectRoute,
  merchantOnly,
  acceptOrder,
);
merchantRouter.patch(
  "/:merchantId/orders/:orderId/reject",
  protectRoute,
  merchantOnly,
  rejectOrder,
);
merchantRouter.patch(
  "/:merchantId/orders/:orderId/ready",
  protectRoute,
  merchantOnly,
  readyOrder,
);
merchantRouter.patch(
  "/:merchantId/orders/:orderId/cancel",
  protectRoute,
  merchantOnly,
  cancelMerchantOrder,
);

export default merchantRouter;

import { Router } from "express";
import { merchantOnly, protectRoute } from "../middlewares/auth.middleware.js";
import {
  getMerchantDetails,
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
} from "../controller/merchant.controller.js";
import { upload } from "../middlewares/upload.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { merchantUpdateInput } from "../schemas/merchant.schema.js";

const merchantRouter = Router();

//public routes
merchantRouter.get("/:merchantId/details", getMerchantDetails);
merchantRouter.get("/", getMerchants);
merchantRouter.get("/:merchantId/products", getMerchantProducts);

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
merchantRouter.get(
  "/:merchantId/orders/:orderId/accept",
  protectRoute,
  merchantOnly,
  acceptOrder,
);
merchantRouter.get(
  "/:merchantId/orders/:orderId/reject",
  protectRoute,
  merchantOnly,
  rejectOrder,
);
merchantRouter.get(
  "/:merchantId/orders/:orderId/ready",
  protectRoute,
  merchantOnly,
  readyOrder,
);

//TODO: GET merchant stats

export default merchantRouter;

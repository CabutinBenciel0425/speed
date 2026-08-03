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
} from "../controller/merchant.controller.js";
import { upload } from "../middlewares/upload.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { merchantUpdateInput } from "../schemas/merchant.schema.js";

const merchantRouter = Router();

//public routes
merchantRouter.get("/:merchantId/details", getMerchantDetails);
merchantRouter.get("/", getMerchants);

//customer routes
merchantRouter.get(
  "/:merchantId/products",
  protectRoute,
  merchantOnly,
  getMerchantProducts,
);

merchantRouter.patch(
  "/favorites/:merchantId/status",
  protectRoute,
  toggleMerchantFavorite,
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

//TODO: GET merchant stats

export default merchantRouter;

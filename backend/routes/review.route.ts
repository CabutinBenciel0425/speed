import { Router } from "express";
import {
  driverOnly,
  merchantOnly,
  protectRoute,
} from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { reviewschema } from "../schemas/review.schema.js";
import {
  customerReviewToDriver,
  customerReviewToMerchant,
  getCustomerReviews,
  getDriverReviews,
  getMerchantReviews,
} from "../controller/review.controller.js";

const reviewRouter = Router();

reviewRouter.post(
  "/orders/:orderId/driver",
  protectRoute,
  validate(reviewschema),
  customerReviewToDriver,
);

reviewRouter.post(
  "/orders/:orderId/merchant",
  protectRoute,
  merchantOnly,
  validate(reviewschema),
  customerReviewToMerchant,
);

reviewRouter.post("/merchant", protectRoute, merchantOnly, getMerchantReviews);
reviewRouter.post("/driver", protectRoute, driverOnly, getDriverReviews);

reviewRouter.post("/me", protectRoute, getCustomerReviews);
export default reviewRouter;

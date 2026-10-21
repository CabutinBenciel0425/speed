import { Router } from "express";
import {
  driverOnly,
  merchantOnly,
  customersOnly,
  protectRoute,
} from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  reviewVisibilitySchema,
  reviewschema,
  updateReviewSchema,
} from "../schemas/review.schema.js";
import {
  customerReviewToDriver,
  customerReviewToMerchant,
  getCustomerReviews,
  getDriverReviews,
  getMerchantReviews,
  getPublicMerchantReviews,
  updateCustomerMerchantReview,
  deleteCustomerMerchantReview,
  setMerchantReviewVisibility,
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
  customersOnly,
  validate(reviewschema),
  customerReviewToMerchant,
);

reviewRouter.get("/merchant/:merchantId", getPublicMerchantReviews);
reviewRouter.get("/merchant", protectRoute, merchantOnly, getMerchantReviews);
reviewRouter.patch(
  "/merchant/:reviewId/visibility",
  protectRoute,
  merchantOnly,
  validate(reviewVisibilitySchema),
  setMerchantReviewVisibility,
);
reviewRouter.post("/driver", protectRoute, driverOnly, getDriverReviews);

reviewRouter.get("/me", protectRoute, customersOnly, getCustomerReviews);
reviewRouter.post("/me", protectRoute, customersOnly, getCustomerReviews);
reviewRouter.patch(
  "/:reviewId",
  protectRoute,
  customersOnly,
  validate(updateReviewSchema),
  updateCustomerMerchantReview,
);
reviewRouter.delete(
  "/:reviewId",
  protectRoute,
  customersOnly,
  deleteCustomerMerchantReview,
);
export default reviewRouter;

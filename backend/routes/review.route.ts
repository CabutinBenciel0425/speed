import { Router } from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { reviewschema } from "../schemas/review.schema.js";
import { customerReview } from "../controller/review.controller.js";

const reviewRouter = Router();

reviewRouter.post(
  "/:orderId/:targetType",
  protectRoute,
  validate(reviewschema),
  customerReview,
);

export default reviewRouter;

import {
  getCustomerReviewsService,
  getDriverReviewsService,
  getMerchantReviewsService,
  reviewCustomerToDriverService,
  reviewCustomerToMerchantService,
} from "../services/review.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import type { Response, Request } from "express";
import { NotFoundError, UnauthorizedError } from "../utils/errors.js";

export const customerReviewToDriver = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    const { rating, comment } = req.body;
    const orderId = req.params.orderId ? req.params.orderId[0] : null;

    if (!orderId) {
      throw new NotFoundError("Order id");
    }

    if (!user) {
      throw new UnauthorizedError("Unauthorized user");
    }

    const newReview = await reviewCustomerToDriverService(
      rating,
      comment,
      user._id.toString(),
      orderId,
    );

    res.status(201).json({
      success: true,
      data: newReview,
    });
  },
);

export const customerReviewToMerchant = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    const { rating, comment } = req.body;
    const orderId = req.params.orderId ? req.params.orderId[0] : null;

    if (!orderId) {
      throw new NotFoundError("Order id");
    }

    if (!user) {
      throw new UnauthorizedError("Unauthorized user");
    }

    const newReview = await reviewCustomerToMerchantService(
      rating,
      comment,
      user._id.toString(),
      orderId,
    );

    res.status(201).json({
      success: true,
      data: newReview,
    });
  },
);

export const getMerchantReviews = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedError("Unauthorized user");
    }
    const reviews = await getMerchantReviewsService(user);

    res.status(200).json({
      success: true,
      data: reviews,
    });
  },
);

export const getDriverReviews = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedError("Unauthorized user");
    }
    const reviews = await getDriverReviewsService(user);

    res.status(200).json({
      success: true,
      data: reviews,
    });
  },
);

export const getCustomerReviews = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedError("Unauthorized user");
    }
    const reviews = await getCustomerReviewsService(user._id.toString());

    res.status(200).json({
      success: true,
      data: reviews,
    });
  },
);

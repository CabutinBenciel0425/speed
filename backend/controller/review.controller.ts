import {
  getCustomerReviewsService,
  getDriverReviewsService,
  getMerchantReviewsService,
  reviewCustomerToDriverService,
  reviewCustomerToMerchantService,
} from "../services/review.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import type { Response, Request } from "express";
import { NotFoundError } from "../utils/errors.js";

export const customerReviewToDriver = asyncHandler(
  async (req: Request, res: Response) => {
    const { rating, comment } = req.body;
    const orderId = req.params.orderId ? req.params.orderId[0] : null;

    if (!orderId) {
      throw new NotFoundError("Order id");
    }

    const newReview = await reviewCustomerToDriverService(
      rating,
      comment,
      req.user?._id.toString(),
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
    const { rating, comment } = req.body;
    const orderId = req.params.orderId ? req.params.orderId[0] : null;

    if (!orderId) {
      throw new NotFoundError("Order id");
    }

    const newReview = await reviewCustomerToMerchantService(
      rating,
      comment,
      req.user?._id.toString(),
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
    const reviews = await getMerchantReviewsService(req.user._id.toString());

    res.status(200).json({
      success: true,
      data: reviews,
    });
  },
);

export const getDriverReviews = asyncHandler(
  async (req: Request, res: Response) => {
    const reviews = await getDriverReviewsService(req.user._id.toString());

    res.status(200).json({
      success: true,
      data: reviews,
    });
  },
);

export const getCustomerReviews = asyncHandler(
  async (req: Request, res: Response) => {
    const reviews = await getCustomerReviewsService(req.user._id.toString());

    res.status(200).json({
      success: true,
      data: reviews,
    });
  },
);

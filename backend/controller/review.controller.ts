import {
  getCustomerReviewsService,
  getDriverReviewsService,
  getMerchantReviewsService,
  getPublicMerchantReviewsService,
  updateCustomerMerchantReviewService,
  deleteCustomerMerchantReviewService,
  setMerchantReviewVisibilityService,
  reviewCustomerToDriverService,
  reviewCustomerToMerchantService,
} from "../services/review.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import type { Response, Request } from "express";
import { NotFoundError, UnauthorizedError } from "../utils/errors.js";
import { buildQuery } from "../utils/buildQuery.js";

export const customerReviewToDriver = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    const { rating, comment } = req.body;
    const orderId = req.params.orderId as string;

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
    const orderId = req.params.orderId as string;

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

export const getPublicMerchantReviews = asyncHandler(
  async (req: Request, res: Response) => {
    const reviews = await getPublicMerchantReviewsService(
      req.params.merchantId as string,
    );
    res.status(200).json({ success: true, data: reviews });
  },
);

export const updateCustomerMerchantReview = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError("Unauthorized user");
    const review = await updateCustomerMerchantReviewService(
      req.params.reviewId as string,
      req.user._id.toString(),
      req.body,
    );
    res.status(200).json({ success: true, data: review });
  },
);

export const deleteCustomerMerchantReview = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError("Unauthorized user");
    await deleteCustomerMerchantReviewService(
      req.params.reviewId as string,
      req.user._id.toString(),
    );
    res.status(200).json({ success: true, message: "Review deleted" });
  },
);

export const setMerchantReviewVisibility = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError("Unauthorized user");
    const review = await setMerchantReviewVisibilityService(
      req.params.reviewId as string,
      req.user._id.toString(),
      req.body.isHidden,
    );
    res.status(200).json({ success: true, data: review });
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
    const query = buildQuery(req.query);
    const { reviews, total } = await getDriverReviewsService(user, query);

    res.status(200).json({
      success: true,
      data: reviews,
      pagination: {
        total,
        page: query.page,
        limit: query.limit,
        pages: Math.ceil(total / query.limit),
      },
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

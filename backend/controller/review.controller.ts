import { reviewCustomerToTargetService } from "../services/review.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import type { Response, Request } from "express";
import { NotFoundError } from "../utils/errors.js";

export const customerReview = asyncHandler(
  async (req: Request, res: Response) => {
    const { rating, comment } = req.body;
    const orderId = req.params.orderId ? req.params.orderId[0] : null;
    const targetType = req.params.targetType;

    if (!orderId) {
      throw new NotFoundError("Order id");
    }

    if (targetType !== "Driver" && targetType !== "Merchant") {
      throw new NotFoundError("Review target type");
    }

    const newReview = await reviewCustomerToTargetService(
      rating,
      comment,
      req.user?._id.toString(),
      orderId,
      targetType,
    );

    res.status(201).json({
      success: true,
      data: newReview,
    });
  },
);

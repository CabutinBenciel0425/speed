import { asyncHandler } from "../utils/asyncHandler.js";
import type { Request, Response } from "express";
import { UnauthorizedError } from "../utils/errors.js";
import { createCheckoutService } from "../services/payment.service.js";

export const createCheckout = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;

    if (!user) {
      throw new UnauthorizedError("Unauthorized user");
    }

    const newPayment = await createCheckoutService(user._id.toString());

    res.json({
      success: true,
      data: newPayment,
    });
  },
);

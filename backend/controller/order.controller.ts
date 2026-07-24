import type { createOrderInput } from "../schemas/order.schema.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import type { Request, Response } from "express";
import { NotFoundError } from "../utils/errors.js";
import { createNewOrder } from "../services/order.service.js";

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const payload: createOrderInput = req.body;

  if (!user) {
    throw new NotFoundError("User");
  }

  const newOrder = await createNewOrder(user._id.toString(), payload);

  res.status(201).json({
    success: true,
    data: newOrder,
  });
});

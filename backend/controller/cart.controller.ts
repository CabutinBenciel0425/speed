import type { addToCartInput } from "../schemas/cart.schema.js";
import { addItemToCart } from "../services/cart.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import type { Request, Response } from "express";
import { NotFoundError } from "../utils/errors.js";

export const addToCart = asyncHandler(async (req: Request, res: Response) => {
  const item: addToCartInput = req.body;
  const user = req.user;

  if (!user) {
    throw new NotFoundError("User");
  }

  const updatedCart = await addItemToCart(user._id.toString(), item);

  res.status(201).json({
    success: true,
    message: "Item added to cart successfully",
    data: updatedCart,
  });
});

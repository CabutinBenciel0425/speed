import type { addToCartInput } from "../schemas/cart.schema.js";
import {
  addItemToCart,
  changeNote,
  deleteItemInCart,
  toggleQuantityItem,
} from "../services/cart.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import type { Request, Response } from "express";
import { NotFoundError } from "../utils/errors.js";
import Cart from "../models/cart.model.js";

export const getCart = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    throw new NotFoundError("User");
  }

  const cart = await Cart.findOne({ customer: user._id });

  if (!cart) {
    return res.status(201).json({
      success: true,
      message: "You have nothing on your cart",
    });
  }

  res.status(201).json({
    success: true,
    data: cart,
  });
});

export const addToCart = asyncHandler(async (req: Request, res: Response) => {
  const item: addToCartInput = req.body;
  const user = req.user;

  if (!user) {
    throw new NotFoundError("User");
  }

  const updatedCart = await addItemToCart(user, item);

  res.status(201).json({
    success: true,
    message: "Item added to cart successfully",
    data: updatedCart,
  });
});

export const changeItemNote = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    const { productId, note } = req.body;

    if (!user) {
      throw new NotFoundError("User");
    }

    const updatedCart = await changeNote(user._id.toString(), productId, note);

    res.status(201).json({
      success: true,
      data: updatedCart,
    });
  },
);

export const toggleQuantity = asyncHandler(
  async (req: Request, res: Response) => {
    const { quantity, productId } = req.body;
    const user = req.user;

    if (!user) {
      throw new NotFoundError("User");
    }

    const cart = await toggleQuantityItem(
      user._id.toString(),
      productId,
      quantity,
    );

    if (!cart) {
      return res.status(201).json({
        success: true,
        message: "Your cart is now empty",
      });
    }

    res.status(201).json({
      success: true,
      message: "Item quantity updated",
      data: cart,
    });
  },
);

export const deleteItem = asyncHandler(async (req: Request, res: Response) => {
  const { productId } = req.body;
  const user = req.user;

  if (!user) {
    throw new NotFoundError("User");
  }

  const cart = await deleteItemInCart(user._id.toString(), productId);

  if (!cart) {
    return res.status(201).json({
      success: true,
      message: "Your cart is now empty",
    });
  }

  res.status(201).json({
    success: true,
    message: "Item deleted successfully",
    data: cart,
  });
});

export const clearCart = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    throw new NotFoundError("User");
  }

  const cart = await Cart.findOne({ customer: user._id });

  if (!cart) {
    throw new NotFoundError("Cart");
  }

  await Cart.findByIdAndDelete(cart._id);

  res.status(201).json({
    success: true,
    message: "Cart deleted successfully",
  });
});

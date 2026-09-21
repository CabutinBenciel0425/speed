import type { addToCartInput } from "../schemas/cart.schema.js";
import {
  addItemToCart,
  changeCartNoteService,
  changeItemNoteService,
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

  const cart = await Cart.findOne({ customer: user._id }).populate([
    "items.product",
    "merchant",
  ]);

  if (!cart) {
    return res.status(200).json({
      success: true,
      message: "You have nothing on your cart",
    });
  }

  res.status(200).json({
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

    const updatedCart = await changeItemNoteService(
      user._id.toString(),
      productId,
      note,
    );

    res.status(200).json({
      success: true,
      data: updatedCart,
    });
  },
);

export const changeCartNote = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    const { cartId, note } = req.body;

    if (!user) {
      throw new NotFoundError("User");
    }

    const updatedCart = await changeCartNoteService(
      user._id.toString(),
      cartId,
      note,
    );

    res.status(200).json({
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

    res.status(200).json({
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

  res.status(200).json({
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
    return res.status(200).json({
      success: true,
      message: "Cart has no item to delete",
    });
  }

  await Cart.findByIdAndDelete(cart._id);

  res.status(200).json({
    success: true,
    message: "Cart deleted successfully",
  });
});

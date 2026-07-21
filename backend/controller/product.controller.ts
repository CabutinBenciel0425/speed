import { asyncHandler } from "../utils/asyncHandler.js";
import type { Request, Response } from "express";
import { NotFoundError } from "../utils/errors.js";
import { createNewProduct } from "../services/product.service.js";
import type { ProductInput } from "../schemas/product.schema.js";

export const addProduct = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const merchantId = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;
  const payload: ProductInput = req.body;

  if (!user) {
    throw new NotFoundError("User");
  }

  if (!merchantId) {
    throw new NotFoundError("Merchant is undefined or");
  }

  const newProduct = await createNewProduct(merchantId, payload);

  await newProduct.populate("merchant");

  res.status(201).json({
    success: true,
    data: newProduct,
  });
});

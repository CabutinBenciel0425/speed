import type { AddressInput } from "../schemas/address.schema.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import type { Request, Response } from "express";
import { NotFoundError } from "../utils/errors.js";
import { createNewAddress } from "../services/address.service.js";

export const addAddress = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const payload: AddressInput = req.body;

  console.log(req.body);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  const newAddress = await createNewAddress(payload, user._id.toString());

  await newAddress.populate("user");

  res.status(201).json({
    success: true,
    data: newAddress,
  });
});

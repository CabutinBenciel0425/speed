import type {
  AddressInput,
  UpdateAddressInput,
} from "../schemas/address.schema.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import type { Request, Response } from "express";
import { NotFoundError } from "../utils/errors.js";
import {
  createNewAddress,
  toggleDefaultAddress,
  updateAddressDetails,
} from "../services/address.service.js";
import type { AddressType } from "../types/types.js";

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

export const updateAddress = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    const payload: UpdateAddressInput = req.body;

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const updatedAddress = await updateAddressDetails(
      user._id.toString(),
      payload,
    );

    await updatedAddress.populate("user");

    res.status(201).json({
      success: true,
      data: updatedAddress,
    });
  },
);

export const toggleIsDefault = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    const addressType = req.params.addressType as AddressType;

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const addresses = await toggleDefaultAddress(
      user._id.toString(),
      addressType,
    );

    addresses.forEach((address) => address.populate("user"));

    res.status(201).json({
      success: true,
      data: addresses,
    });
  },
);

import type {
  AddressInput,
  UpdateAddressInput,
} from "../schemas/address.schema.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import type { Request, Response } from "express";
import { NotFoundError } from "../utils/errors.js";
import {
  createNewAddress,
  deleteUserAddress,
  toggleDefaultAddress,
  updateAddressDetails,
} from "../services/address.service.js";
import type { AddressType } from "../types/types.js";
import Address from "../models/address.model.js";
import type { IUser } from "../models/user.model.js";

export const getAllAddress = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) {
      throw new NotFoundError("User");
    }
    const allAddress = await Address.find({ user: user._id }).select("-user");

    if (allAddress.length === 1) {
      await Address.findOneAndUpdate({ user: user._id }, { isDefault: true });
    }

    res.status(200).json({
      success: true,
      data: allAddress,
    });
  },
);

export const addAddress = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const payload: AddressInput = req.body;

  if (!user) {
    throw new NotFoundError("User");
  }

  const newAddress = await createNewAddress(payload, user);

  await newAddress.populate<"user">("user");

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
      throw new NotFoundError("User");
    }

    const updatedAddress = await updateAddressDetails(user, payload);

    await updatedAddress.populate("user");

    res.status(200).json({
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
      throw new NotFoundError("User");
    }

    const addresses = await toggleDefaultAddress(user, addressType);

    res.status(200).json({
      success: true,
      data: addresses,
    });
  },
);

export const deleteAddress = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    const addressType = req.params.addressType as AddressType;

    if (!user) {
      throw new NotFoundError("User");
    }

    const address = await deleteUserAddress(user, addressType);

    res.status(200).json({
      success: !!address,
      message: !!address
        ? "Address successfully deleted"
        : "No address has been deleted",
    });
  },
);

import { Types } from "mongoose";
import Order from "../models/order.model.js";
import type { createOrderInput } from "../schemas/order.schema.js";
import Address from "../models/address.model.js";
import { ConflictError, NotFoundError } from "../utils/errors.js";
import Merchant from "../models/merchant.model.js";
import { BASE_DELIVERY_FEE } from "../config/constants.js";

export const createNewOrder = async (
  userId: string,
  payload: createOrderInput,
) => {
  const merchant = await Merchant.findById(payload.merchant);
  const address = await Address.findOne({ user: userId, isDefault: true });

  if (!merchant) {
    throw new NotFoundError("Merchant");
  }

  if (!address) {
    throw new ConflictError("There is no default address selected");
  }

  const pricing = {
    subtotal: payload.items.reduce(
      (acc, item) => acc + item.quantity * item.unitPrice,
      0,
    ),
    deliveryFee: BASE_DELIVERY_FEE,
    get total() {
      return this.subtotal + this.deliveryFee;
    },
  };

  const newOrder = new Order({
    customer: userId,
    merchant: merchant._id,
    deliveryAddress: {
      address: address._id,
      street: address.street,
      barangay: address.barangay,
      city: address.city,
      province: address.province,
      location: address.location,
    },
    payment: payload.payment,
    pricing: {
      subtotal: pricing.subtotal,
      deliveryFee: pricing.deliveryFee,
      total: pricing.total,
    },
    customerNote: payload.customerNote,
  });
  await newOrder.save();
  return newOrder;
};

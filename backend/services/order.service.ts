import { Types } from "mongoose";
import Order from "../models/order.model.js";
import type { createOrderInput } from "../schemas/order.schema.js";
import Address from "../models/address.model.js";
import { ConflictError, NotFoundError } from "../utils/errors.js";
import Merchant from "../models/merchant.model.js";
import { BASE_DELIVERY_FEE } from "../config/constants.js";
import { recalculateCart } from "./cart.service.js";
import Cart from "../models/cart.model.js";
import { generateOrderNumber } from "../utils/generateOrderNumber.js";

export const createNewOrder = async (userId: string) => {
  await recalculateCart(userId);

  const cart = await Cart.findOne({ customer: userId });
  if (!cart) {
    throw new NotFoundError("Cart");
  }
  const merchant = await Merchant.findById(cart?.merchant);
  const address = await Address.findOne({ user: userId, isDefault: true });

  if (!merchant) {
    throw new NotFoundError("Merchant");
  }

  if (!address) {
    throw new ConflictError("There is no default address selected");
  }

  const newOrder = new Order({
    customer: cart.customer,
    merchant: cart.merchant,
    orderNumber: generateOrderNumber(),
    deliveryAddress: cart.deliveryAddress,
    payment: {
      method: cart?.payment?.method,
      status: "Pending",
      transactionId: null,
    },
    pricing: {
      subtotal: cart?.pricing?.subtotal,
      serviceFee: cart?.pricing?.serviceFee,
      discount: cart?.pricing?.discount,
      deliveryFee: cart?.pricing?.deliveryFee,
      total: cart?.pricing?.total,
    },
    status: "Pending",
    customerNote: cart.customerNote,
    estimatedPreparationTime: cart.estimatedPreparationTime,
    estimatedDeliveryTime: cart.estimatedDeliveryTime,
    driver: null,
  });
  await newOrder.save();

  await Cart.findByIdAndDelete(cart._id);
  return newOrder;
};

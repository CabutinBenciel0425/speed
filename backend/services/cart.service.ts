import type { addToCartInput } from "../schemas/cart.schema.js";
import { ConflictError, NotFoundError } from "../utils/errors.js";
import User from "../models/user.model.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import Address from "../models/address.model.js";
import { computeDeliveryFee, computeDistance } from "./delivery.service.js";
import Merchant from "../models/merchant.model.js";
import { ADDITIONAL_PREPARATION_TIME_PER_PIECE } from "../config/constants.js";

export const addItemToCart = async (
  userId: string,
  addingItem: addToCartInput,
) => {
  let updatedCart;
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError("User");
  }

  const address = await Address.findOne({ user: userId, isDefault: true });

  if (!address) {
    throw new NotFoundError("Address not found");
  }

  const product = await Product.findById(addingItem.product);

  if (!product) {
    throw new NotFoundError("Product");
  }

  if (!product.isAvailable) {
    throw new ConflictError("Item is not available at the moment");
  }

  const merchant = await Merchant.findById(product.merchant);

  if (!merchant) {
    throw new NotFoundError("Merchant");
  }

  const merchantCoords = merchant.address?.location?.coordinates as
    | [number, number]
    | undefined;
  const addressCoords = address.location?.coordinates as
    | [number, number]
    | undefined;

  if (!merchantCoords) {
    throw new NotFoundError("Merchant address not found");
  }

  if (!addressCoords) {
    throw new NotFoundError("Address coordinates not found");
  }

  const distanceResult = await computeDistance(merchantCoords, addressCoords);

  const deliveryFee = computeDeliveryFee(distanceResult.distanceKm);

  console.log(distanceResult);

  const cart = await Cart.findOne({ customer: user._id });

  if (!cart) {
    updatedCart = new Cart({
      customer: user._id,
      merchant: product.merchant,
      items: [
        {
          product: product._id,
          quantity: addingItem.quantity,
          notes: addingItem.notes,
        },
      ],
      deliveryAddress: {
        address: address._id,
        street: address.street,
        barangay: address.barangay,
        city: address.city,
        province: address.province,
        location: {
          coordinates: address.location.coordinates,
        },
      },
      payment: {
        method: addingItem.payment,
      },
      pricing: {
        subtotal: product.price * addingItem.quantity,
        serviceFee: 0,
        discount: 0,
        deliveryFee: deliveryFee,
        total: product.price * addingItem.quantity + deliveryFee,
      },
      estimatedPreparationTime: product.preparationTime,
      estimatedDeliveryTime: distanceResult.durationMinutes,
    });

    await updatedCart.save();
    await updatedCart.populate("items.product");
    return updatedCart;
  }

  if (cart?.merchant.toString() !== product.merchant?.toString()) {
    throw new ConflictError(
      `Your cart contains items from another restaurant ${cart?.merchant} = cart.merchant | ${product.merchant} = product.merchant`,
    );
  }

  const existingItem = cart?.items.find(
    (item) => item.product.toString() === addingItem.product.toString(),
  );

  if (existingItem) {
    const cartAddress = cart.deliveryAddress?.location?.coordinates;
    const newAddress = addressCoords;

    if (!cartAddress) {
      throw new NotFoundError("Address coordinates in cart not found");
    }
    if (
      cartAddress &&
      newAddress &&
      cartAddress[0] === newAddress[0] &&
      cartAddress[1] === newAddress[1]
    ) {
      updatedCart = await Cart.findOneAndUpdate(
        {
          customer: user._id,
          "items.product": addingItem.product,
        },
        {
          $inc: { "items.$.quantity": addingItem.quantity },
        },
        { new: true, runValidators: true },
      ).populate("items.product");
    } else {
      const distanceResult = await computeDistance(
        merchantCoords,
        addressCoords,
      );

      const updatedDeliveryFee = computeDeliveryFee(distanceResult.distanceKm);
      updatedCart = await Cart.findOneAndUpdate(
        {
          customer: user._id,
          "items.product": addingItem.product,
        },
        {
          $inc: { "items.$.quantity": addingItem.quantity },
        },
        { new: true, runValidators: true },
      ).populate("items.product");
    }
  } else {
    updatedCart = await Cart.findOneAndUpdate(
      { customer: user._id },
      {
        $push: {
          items: {
            product: addingItem.product,
            quantity: addingItem.quantity,
            notes: addingItem.notes,
          },
        },
      },
      { new: true, runValidators: true },
    ).populate("items.product");
  }

  const recalculatedCart = await recalculateCart(userId);
  await recalculatedCart.populate("items.product");

  return recalculatedCart;
};

export const changeNote = async (
  userId: string,
  productId: string,
  note: string,
) => {
  const cart = await Cart.findOne({ customer: userId });
  if (!cart) {
    throw new NotFoundError("Cart");
  }

  const item = cart.items.find(
    (item) => item.product.toString() === productId.toString(),
  );

  if (!item) {
    throw new Error("Product in the cart");
  }

  item.notes = note;

  await cart.save();

  recalculateCart(userId);

  // const recalculatedCart = await recalculateCart(userId);
  // await recalculatedCart.populate("items.product");

  // return recalculatedCart;

  return cart;
};

export const toggleQuantityItem = async (
  userId: string,
  productId: string,
  quantity: number,
) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw new NotFoundError("Product");
  }

  if (!product.isAvailable) {
    throw new ConflictError("Item is not available at the moment");
  }

  const cart = await Cart.findOne({ customer: userId });

  if (!cart) {
    throw new NotFoundError("Cart");
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId,
  );
  if (itemIndex === -1) throw new NotFoundError("Product");

  if (quantity <= 0) {
    cart.items.splice(itemIndex, 1);
  } else {
    const item = cart.items[itemIndex];
    if (!item) throw new NotFoundError("Product");
    item.quantity = quantity;
  }

  if (cart.items.length === 0) {
    await Cart.findByIdAndDelete(cart._id);
    return null;
  }

  await cart.save();

  await recalculateCart(userId);

  return cart;
};

export const deleteItemInCart = async (userId: string, productId: string) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw new NotFoundError("Product");
  }

  if (!product.isAvailable) {
    throw new ConflictError("Item is not available at the moment");
  }

  const cart = await Cart.findOne({ customer: userId });

  if (!cart) {
    throw new NotFoundError("Cart");
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId,
  );
  if (itemIndex === -1) throw new NotFoundError("Product");

  cart.items.splice(itemIndex, 1);

  if (cart.items.length === 0) {
    await Cart.findByIdAndDelete(cart._id);
    return null;
  }

  await cart.save();

  await recalculateCart(userId);

  return cart;
};

export const recalculateCart = async (userId: string) => {
  const cart = await Cart.findOne({ customer: userId });

  if (!cart) {
    throw new NotFoundError("Cart");
  }

  const products = await Promise.all(
    cart.items.map(async (item) => {
      const product = await Product.findById(item.product);

      if (!product) {
        throw new NotFoundError("Product");
      }

      return {
        product,
        quantity: item.quantity,
      };
    }),
  );

  const merchant = await Merchant.findById(cart.merchant);

  if (!merchant) {
    throw new NotFoundError("Merchant");
  }
  const merchantCoords = merchant?.address?.location?.coordinates as
    | [number, number]
    | undefined;

  if (!merchantCoords) {
    throw new NotFoundError("Merchant Coordinates");
  }

  const defaultAddress = await Address.findOne({ user: userId });

  if (!defaultAddress) {
    throw new NotFoundError("Address");
  }
  const defaultAddressCoords = defaultAddress?.location?.coordinates as
    | [number, number]
    | undefined;

  if (!defaultAddressCoords) {
    throw new NotFoundError("User address coordinates");
  }

  const cartSubtotal = products.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  const distanceResult = await computeDistance(
    merchantCoords,
    defaultAddressCoords,
  );

  const cartDeliveryFee = computeDeliveryFee(distanceResult.distanceKm);

  const prepTimes = products.map((item) => {
    return (
      item.product.preparationTime +
      (item.quantity - 1) * ADDITIONAL_PREPARATION_TIME_PER_PIECE
    );
  });

  const cartPreparationTime = Math.max(...prepTimes);

  const cartDeliveryTime = distanceResult.durationMinutes;
  const cartTotalPrice = cartSubtotal + cartDeliveryFee;
  if (cartSubtotal === undefined) {
    throw new Error("Subtotal is missing");
  }

  if (cartDeliveryFee === undefined) {
    throw new Error("Delivery fee is missing");
  }

  if (cartPreparationTime === undefined) {
    throw new Error("Preparation time is missing");
  }

  if (cartDeliveryTime === undefined) {
    throw new Error("Delivery time is missing");
  }

  if (cartTotalPrice === undefined) {
    throw new Error("Total price is missing");
  }

  if (!cart.pricing) {
    cart.pricing = {
      subtotal: 0,
      serviceFee: 0,
      discount: 0,
      deliveryFee: 0,
      total: 0,
    };
  }

  cart.pricing.subtotal = cartSubtotal;
  cart.pricing.deliveryFee = cartDeliveryFee;
  cart.pricing.total = cartTotalPrice;

  cart.estimatedPreparationTime = cartPreparationTime;
  cart.estimatedDeliveryTime = cartDeliveryTime;

  await cart.save();

  return cart;
};

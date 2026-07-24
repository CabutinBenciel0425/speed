import type { addToCartInput } from "../schemas/cart.schema.js";
import { ConflictError, NotFoundError } from "../utils/errors.js";
import User from "../models/user.model.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";

export const addItemToCart = async (
  userId: string,
  addingItem: addToCartInput,
) => {
  let updatedCart;
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError("User");
  }

  const product = await Product.findById(addingItem.product);

  if (!product) {
    throw new NotFoundError("Product");
  }

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

  console.log(existingItem);

  if (existingItem) {
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

  return updatedCart;
};

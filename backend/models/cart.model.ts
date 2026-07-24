import mongoose, { model, Schema } from "mongoose";

const cartSchema = new Schema({
  customer: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },
  merchant: {
    type: mongoose.Types.ObjectId,
    ref: "Merchant",
    required: true,
  },
  items: [
    {
      product: {
        type: mongoose.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        default: 1,
        min: [1, "Quantity must not be below 1"],
      },
      notes: {
        type: String,
      },
    },
  ],
});

const Cart = model("Cart", cartSchema);
export default Cart;

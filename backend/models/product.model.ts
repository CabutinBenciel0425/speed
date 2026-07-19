import mongoose, { model, Schema } from "mongoose";

const productSchema = new Schema(
  {
    merchant: {
      type: mongoose.Types.ObjectId,
      ref: "Merchant",
    },
    category: {
      type: mongoose.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    name: {
      type: String,
      required: true,
      min: 2,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
    },
  },
  { timestamps: true },
);

const Product = model("Product", productSchema);
export default Product;

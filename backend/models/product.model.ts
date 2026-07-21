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
    slug: {
      type: String,
      required: true,
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
    preparationTime: {
      type: Number,
      required: true,
    },
    ingredients: [
      {
        type: String,
      },
    ],
    tags: [
      {
        type: String,
      },
    ],
    isAvailable: {
      type: Boolean,
      required: true,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true },
);

const Product = model("Product", productSchema);
export default Product;

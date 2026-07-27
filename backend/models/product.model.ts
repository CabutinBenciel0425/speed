import mongoose, { model, Schema, Document, Types } from "mongoose";

export interface IProduct extends Document {
  merchant: Types.ObjectId;
  category: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  price: number;
  image?: string;
  preparationTime: number;
  ingredients: string[];
  tags: string[];
  isAvailable: boolean;
  isFeatured: boolean;
}

const productSchema = new Schema<IProduct>(
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
        required: true,
      },
    ],
    tags: [
      {
        type: String,
        required: true,
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

const Product = model<IProduct>("Product", productSchema);
export default Product;

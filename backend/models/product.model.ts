import mongoose, { model, Schema, Document, Types } from "mongoose";
import { number } from "zod";

export interface IProduct extends Document {
  merchant: Types.ObjectId;
  merchantName: string;
  merchantLogo: string;
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
  totalSold: number;
}

const productSchema = new Schema<IProduct>(
  {
    merchant: {
      type: mongoose.Types.ObjectId,
      ref: "Merchant",
      required: true,
    },
    merchantName: {
      type: String,
      required: true,
    },
    merchantLogo: {
      type: String,
      required: true,
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
    totalSold: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

productSchema.pre("save", async function (this: IProduct) {
  if (this.isNew || this.isModified("merchant")) {
    const merchant = await mongoose.model("Merchant").findById(this.merchant);
    if (merchant) {
      this.merchantName = merchant.merchantName;
      this.merchantLogo = merchant.logo;
    }
  }
});

const Product = model<IProduct>("Product", productSchema);
export default Product;

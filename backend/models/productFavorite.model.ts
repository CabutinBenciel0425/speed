import mongoose, { Schema, model, Document, Types } from "mongoose";

export interface IProductFavorite extends Document {
  user: Types.ObjectId;
  product: Types.ObjectId;
}

const productFavoriteSchema = new Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  { timestamps: true },
);

productFavoriteSchema.index({ user: 1, product: 1 }, { unique: true });

const ProductFavorite = model("ProductFavorite", productFavoriteSchema);
export default ProductFavorite;

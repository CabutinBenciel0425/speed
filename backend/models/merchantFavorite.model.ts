import mongoose, { Schema, model, Document, Types } from "mongoose";

export interface IMerchantFavorite extends Document {
  user: Types.ObjectId;
  merchant: Types.ObjectId;
}

const merchantFavoriteSchema = new Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "User",
    },
    merchant: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "Merchant",
    },
  },
  { timestamps: true },
);

merchantFavoriteSchema.index({ user: 1, merchant: 1 }, { unique: true });

const MerchantFavorite = model("MerchantFavorite", merchantFavoriteSchema);
export default MerchantFavorite;

import mongoose, { Schema, Document, Types, model } from "mongoose";

export interface IReview extends Document {
  order: Types.ObjectId;
  reviewer: Types.ObjectId;
  reviewee: Types.ObjectId;
  targetType: "Merchant" | "Driver";
  rating: number;
  comment: string;
  isHidden: boolean;
}

const reviewSchema = new Schema<IReview>(
  {
    order: {
      type: mongoose.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    reviewer: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewee: {
      type: mongoose.Types.ObjectId,
      required: true,
      refPath: "targetType",
    },
    targetType: {
      type: String,
      enum: ["Merchant", "Driver"],
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    isHidden: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const Review = model<IReview>("Review", reviewSchema);

export default Review;

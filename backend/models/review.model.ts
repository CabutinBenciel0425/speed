import mongoose, { Schema, Document, Types, model } from "mongoose";

export interface IReview extends Document {
  order: Types.ObjectId;
  reviewer: Types.ObjectId;
  reviewee: Types.ObjectId;
  targetType: "Merchant" | "Driver";
  rating: number;
  comment: string;
}

const reviewSchema = new Schema<IReview>(
  {
    order: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    reviewer: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    reviewee: {
      types: mongoose.Types.ObjectId,
      required: true,
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
    },
  },
  { timestamps: true },
);

const Review = model<IReview>("Review", reviewSchema);

export default Review;

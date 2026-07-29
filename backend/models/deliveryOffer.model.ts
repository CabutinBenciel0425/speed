import mongoose, { model, Schema, Document, Types } from "mongoose";

export interface IDeliveryOffer extends Document {
  order: Types.ObjectId;
  driver: Types.ObjectId;
  status: "Pending" | "Accepted" | "Declined" | "Expired";
  expiresAt: Date;
}

const deliveryOfferSchema = new Schema<IDeliveryOffer>(
  {
    order: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    driver: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Declined", "Expired"],
      default: "Pending",
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

deliveryOfferSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 86400 }, //1 day
);

const DeliveryOffer = model<IDeliveryOffer>(
  "DeliveryOffer",
  deliveryOfferSchema,
);
export default DeliveryOffer;

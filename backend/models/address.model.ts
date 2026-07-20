import mongoose, { model, Schema, Types, Document } from "mongoose";

export interface IAddress extends Document {
  user: Types.ObjectId;
  label: "Home" | "Work" | "Other";
  recipientName?: string;
  phoneNumber: string;
  street: string;
  barangay: string;
  city: string;
  province: string;
  mapCoordinates?: {
    latitude?: number | null;
    longitude?: number | null;
  } | null;
  landmark?: string;
  instructions?: string;
  isDefault?: boolean;
}

export const addressSchema = new Schema<IAddress>(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    label: {
      type: String,
      enum: ["Home", "Work", "Other"],
      required: true,
    },
    recipientName: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
    },
    street: {
      type: String,
      required: true,
    },
    barangay: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    province: {
      type: String,
      required: true,
    },
    mapCoordinates: {
      latitude: {
        type: Number,
      },
      longitude: {
        type: Number,
      },
    },
    landmark: {
      type: String,
    },
    instructions: {
      type: String,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const Address = model<IAddress>("Address", addressSchema);
export default Address;

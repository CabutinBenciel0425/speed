import mongoose, { model, Schema } from "mongoose";

export const addressSchema = new Schema(
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

const Address = model("Address", addressSchema);
export default Address;

import mongoose, { model, Schema, Types, Document } from "mongoose";

export interface IAddress extends Document {
  user: Types.ObjectId;
  label: "Home" | "Work" | "Other";
  recipientName?: string;
  phoneNumber: string;
  houseOrUnitNumber: string;
  street: string;
  barangay: string;
  city: string;
  province: string;
  region: string;
  location: {
    type: "Point";
    coordinates?: number[];
  };
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
      required: true,
    },
    houseOrUnitNumber: {
      type: String,
      required: true,
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
    region: {
      type: String,
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
        index: "2dsphere",
        validate: {
          validator: function (v: number[] | undefined): v is number[] {
            if (!v) return false;
            if (v.length !== 2) return false;

            const lng = v[0];
            const lat = v[1];

            return (
              typeof lng === "number" &&
              typeof lat === "number" &&
              lng >= -180 &&
              lng <= 180 &&
              lat >= -90 &&
              lat <= 90
            );
          },
          message: "Coordinates must be [longitude latitude] with valid ranges",
        },
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

import mongoose, { model, Schema, Document, Types } from "mongoose";

export interface IDriver extends Document {
  user: Types.ObjectId;
  avatar?: string;
  vehicleType: "Motorcycle" | "Bicycle";
  plateNumber: string;
  status: "Pending" | "Operational" | "Suspended";
  isAvailable: boolean;
  workingStatus:
    | "Offline"
    | "Available"
    | "Assigned"
    | "HeadingToMerchant"
    | "ArrivedAtMerchant"
    | "Delivering";
  activeOrder: Types.ObjectId;
  currentLocation: {
    types: string;
    coordinates: number[];
  };
  completedDeliveries: number;
  cancelledDeliveries: number;
  totalEarnings: number;
  ratingCount: number;
  averageRating: number;
}

const driverSchema = new Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    avatar: {
      type: String,
    },
    vehicleType: {
      type: String,
      enum: ["Motorcycle", "Bicycle"],
      required: [true, "You must choose between motorcycle and bicycle"],
    },
    plateNumber: {
      type: String,
      required: function (this: any): boolean {
        return this.vehicleType === "Motorcycle";
      },
      trim: true,
      uppercase: true,
      unique: true,
      sparse: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Operational", "Suspended"],
      default: "Pending",
    },
    isAvailable: {
      type: Boolean,
      default: false,
    },
    workingStatus: {
      type: String,
      enum: [
        "Offline",
        "Available",
        "Assigned",
        "HeadingToMerchant",
        "ArrivedAtMerchant",
        "Delivering",
      ],
      default: "Offline",
    },
    activeOrder: {
      type: mongoose.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    currentLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
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
    completedDeliveries: {
      type: Number,
      min: [0, "Completed deliveries cannot be a negative number"],
      default: 0,
    },
    cancelledDeliveries: {
      type: Number,
      min: [0, "Cancelled deliveries cannot be a negative number"],
      default: 0,
    },
    totalEarnings: {
      type: Number,
      min: [0, "Total earnings cannot be a negative number"],
      default: 0,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

driverSchema.index({
  currentLocation: "2dsphere",
});

driverSchema.index({
  activeOrder: 1,
});

driverSchema.index({
  status: 1,
  workingStatus: 1,
  isAvailable: 1,
});

const Driver = model("Driver", driverSchema);

export default Driver;

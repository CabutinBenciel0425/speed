import mongoose, { model, Schema } from "mongoose";

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
      },
    },
    rating: {
      type: Number,
      min: [0, "Rating cannot be below 0"],
      max: [5, "Rating cannot exceed 5"],
      default: 0,
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
  },
  { timestamps: true },
);

driverSchema.index({
  currentLocation: "2dsphere",
});

const Driver = model("Driver", driverSchema);

export default Driver;

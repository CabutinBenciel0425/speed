import mongoose, { model, Schema } from "mongoose";

const driverSchema = new Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
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
  rating: {
    type: Number,
    min: [0, "Rating cannot be below 0"],
    max: [5, "Rating cannot exceed 5"],
  },
  totalDeliveries: {
    type: Number,
    min: [0, "Total deliveries cannot be a negative number"],
  },
  completedDeliveries: {
    type: Number,
    min: [0, "Completed deliveries cannot be a negative number"],
  },
  cancelledDeliveries: {
    type: Number,
    min: [0, "Cancelled deliveries cannot be a negative number"],
  },
  totalEarnings: {
    type: Number,
    min: [0, "Total earnings cannot be a negative number"],
  },
});

const Driver = model("Driver", driverSchema);

export default Driver;

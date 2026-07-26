import mongoose, { model, Schema } from "mongoose";

const orderSchema = new Schema({
  customer: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },
  merchant: {
    type: mongoose.Types.ObjectId,
    ref: "Merchant",
    required: true,
  },
  driver: {
    type: mongoose.Types.ObjectId,
    ref: "Driver",
    default: null,
  },
  orderNumber: {
    type: String,
    required: true,
  },
  items: [
    {
      product: {
        type: mongoose.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      productName: {
        type: String,
        required: true,
      },
      image: {
        type: String,
      },
      quantity: {
        type: Number,
        required: true,
        default: 1,
        min: [1, "The minimum quantity should be atleast 1"],
      },
      unitPrice: {
        type: Number,
        required: true,
      },
      subtotal: {
        type: Number,
        required: true,
      },
      notes: {
        type: String,
      },
    },
  ],
  deliveryAddress: {
    address: {
      type: mongoose.Types.ObjectId,
      ref: "Address",
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
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
  },
  payment: {
    method: {
      type: String,
      required: true,
      enum: ["Cash", "Card", "GCash", "Maya"],
    },
    status: {
      type: String,
      required: true,
      enum: ["Pending", "Paid", "Cancelled"],
      default: "Pending",
    },
    transactionId: {
      type: String,
      required: function () {
        return this.status === "Paid";
      },
      message: "Transaction id is required when the payment status is 'PAID'",
    },
  },
  pricing: {
    subtotal: {
      type: Number,
      required: true,
    },
    deliveryFee: {
      type: Number,
      required: true,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
  },
  status: {
    type: String,
    required: true,
    enum: [
      "Pending",
      "Preparing",
      "ReadyForPickup",
      "PickedUp",
      "Delivered",
      "Cancelled",
      "Rejected",
    ],
    default: "Pending",
  },
  customerNote: {
    type: String,
  },
  estimatedPreparationTime: {
    type: Number,
    required: true,
  },
  estimatedDeliveryTime: {
    type: Number,
    required: true,
  },
  driverAssignedAt: {
    type: Date,
  },
  preparingAt: {
    type: Date,
  },
  readyForPickupAt: {
    type: Date,
  },
  pickedUpAt: {
    type: Date,
  },
  deliveredAt: {
    type: Date,
  },
  rejectedAt: {
    type: Date,
  },
  cancelledAt: {
    type: Date,
  },
  cancellationReason: {
    type: String,
  },
});

const Order = model("Order", orderSchema);
export default Order;

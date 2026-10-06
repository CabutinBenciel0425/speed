import mongoose, { model, Schema, Document, Types } from "mongoose";

export interface IOrder extends Document {
  customer: Types.ObjectId;
  merchant: Types.ObjectId;
  driver: Types.ObjectId | null;
  orderNumber: string;
  items: [
    {
      product: Types.ObjectId;
      productName: string;
      image?: string;
      quantity: number;
      unitPrice: number;
      subtotal: number;
      notes: string;
    },
  ];
  deliveryAddress: {
    address: Types.ObjectId;
    recipientName: string;
    phoneNumber: string;
    houseOrUnitNumber: string;
    street: string;
    barangay: string;
    city: string;
    province?: string;
    region: string;
    location: {
      type: string;
      coordinates: number[];
    };
  };
  payment: {
    paymentId?: Types.ObjectId;
    method: "Cash" | "QRPh";
    status: "Pending" | "Paid" | "Cancelled";
    transactionId?: string | null;
  };
  pricing: {
    subtotal: number;
    serviceFee: number;
    discount: number;
    deliveryFee: number;
    total: number;
  };
  status:
    | "Pending"
    | "Preparing"
    | "ReadyForPickup"
    | "PickedUp"
    | "Delivered"
    | "Cancelled"
    | "Rejected"
    | "NoDriverFound";
  driverMatchingStatus: "Searching" | "Assigned" | "NoDriverFound";
  customerNote: string;
  estimatedPreparationTime: number;
  estimatedDeliveryTime: number;
  driverAssignedAt?: Date;
  acceptedAt?: Date;
  driverHeadingToMerchantAt?: Date;
  merchantReceivedAt?: Date;
  preparingAt?: Date;
  driverArrivedAtMerchantAt?: Date;
  readyForPickupAt?: Date;
  pickedUpAt?: Date;
  deliveredAt?: Date;
  rejectedAt?: Date;
  cancelledAt?: Date;
  cancelledBy: "Customer" | "Merchant" | "Admin";
  cancellationReason: string;
}

const orderSchema = new Schema<IOrder>(
  {
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
      recipientName: { type: String, required: true },
      phoneNumber: { type: String, required: true },
      houseOrUnitNumber: { type: String, required: true },
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
            message:
              "Coordinates must be [longitude latitude] with valid ranges",
          },
        },
      },
    },
    payment: {
      paymentId: {
        type: mongoose.Types.ObjectId,
        default: null,
      },
      method: {
        type: String,
        required: true,
        enum: ["Cash", "QRPh"],
      },
      status: {
        type: String,
        required: true,
        enum: ["Pending", "Paid", "Cancelled"],
        default: "Pending",
      },
      transactionId: {
        type: String,
        required: function (this: any) {
          return this.status === "Paid";
        },
        message: "Transaction id is required when the payment status is 'PAID'",
        default: null,
      },
    },
    pricing: {
      subtotal: {
        type: Number,
        required: true,
      },
      serviceFee: {
        type: Number,
        required: true,
        default: 0,
      },
      discount: {
        type: Number,
        required: true,
        default: 0,
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
        "NoDriverFound",
      ],
      default: "Pending",
    },
    driverMatchingStatus: {
      type: String,
      enum: ["Searching", "Assigned", "NoDriverFound"],
      default: "Searching",
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
    acceptedAt: {
      type: Date,
    },
    driverHeadingToMerchantAt: {
      type: Date,
    },
    driverAssignedAt: {
      type: Date,
    },
    merchantReceivedAt: {
      type: Date,
    },
    preparingAt: {
      type: Date,
    },
    driverArrivedAtMerchantAt: {
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
    cancelledBy: {
      type: String,
      enum: ["Customer", "Merchant", "Admin"],
    },
    cancellationReason: {
      type: String,
    },
  },
  { timestamps: true },
);

orderSchema.index({
  status: 1,
});

orderSchema.index({
  customer: 1,
});

orderSchema.index({
  merchant: 1,
});

orderSchema.index({
  driver: 1,
});

const Order = model<IOrder>("Order", orderSchema);
export default Order;

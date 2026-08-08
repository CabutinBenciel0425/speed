import mongoose, { Schema, Document, Types, model } from "mongoose";

export interface IPayment extends Document {
  customer: Types.ObjectId;
  merchant: Types.ObjectId;
  order: Types.ObjectId | null;
  cart: Types.ObjectId;
  orderData: {
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
      street: string;
      barangay: string;
      city: string;
      province: string;
      location: {
        type: string;
        coordinates: number[];
      };
    };
    pricing: {
      subtotal: number;
      serviceFee: number;
      discount: number;
      deliveryFee: number;
      total: number;
    };
    customerNote?: string;
    estimatedPreparationTime: number;
    estimatedDeliveryTime: number;
  };
  provider: "Manual" | "Paymongo";
  method: "Cash" | "QRPh";
  amount: number;
  status: "Pending" | "Paid" | "Failed" | "Expired" | "Refunded";
  paymentIntentId: string | null;
  transactionId: string | null;
  paidAt: Date | null;
  expiresAt: Date;
  expiredAt: Date | null;
  refundedAt: Date | null;
}

const paymentSchema = new Schema<IPayment>(
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
    order: {
      type: mongoose.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    cart: {
      type: mongoose.Types.ObjectId,
      ref: "Cart",
      required: true,
    },
    orderData: {
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
          type: Types.ObjectId,
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

      pricing: {
        subtotal: {
          type: Number,
          required: true,
        },
        serviceFee: {
          type: Number,
          required: true,
        },
        discount: {
          type: Number,
          required: true,
        },
        deliveryFee: {
          type: Number,
          required: true,
        },
        total: {
          type: Number,
          required: true,
        },
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
    },
    provider: {
      type: String,
      enum: ["Manual", "Paymongo"],
    },
    method: {
      type: String,
      enum: ["Cash", "QRPh"],
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Expired", "Refunded"],
      default: "Pending",
    },
    paymentIntentId: {
      type: String,
      validate: {
        validator: function (this: any, value: string | null): boolean {
          if (this.method === "QRPh") {
            return !!(value && value.length > 0);
          }

          return true;
        },
        message: "Payment Intent ID is required for QRPh payments",
      },
    },
    transactionId: {
      type: String,
    },
    paidAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
    },
    expiredAt: {
      type: Date,
    },
    refundedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

const Payment = model<IPayment>("Payment", paymentSchema);

export default Payment;

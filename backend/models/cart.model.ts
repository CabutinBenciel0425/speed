import mongoose, { model, Schema, Types, Document } from "mongoose";

export interface ICart extends Document {
  customer: Types.ObjectId;
  merchant: Types.ObjectId;
  items: [
    {
      product: Types.ObjectId;
      quantity: number;
      note: string;
    },
  ];
  deliveryAddress: {
    address: Types.ObjectId;
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
    method: "Cash" | "QRPh";
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
}

const cartSchema = new Schema<ICart>({
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
  items: [
    {
      product: {
        type: mongoose.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        default: 1,
      },
      note: {
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
  },
  payment: {
    method: {
      type: String,
      required: true,
      enum: ["Cash", "QRPh"],
    },
  },
  pricing: {
    subtotal: {
      type: Number,
      required: true,
      default: 0,
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
      default: 0,
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
});

const Cart = model<ICart>("Cart", cartSchema);
export default Cart;

import mongoose, { model, Schema } from "mongoose";

const cartSchema = new Schema({
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

const Cart = model("Cart", cartSchema);
export default Cart;

// cart
// {
//     customer,
//     merchant,
//     items,

//     deliveryAddress,

//     payment: {
//         method
//     },

//     pricing: {
//         subtotal,
//         deliveryFee,
//         serviceFee,
//         discount,
//         total
//     },

//     customerNote,

//     estimatedPreparationTime,
//     estimatedDeliveryTime
// }

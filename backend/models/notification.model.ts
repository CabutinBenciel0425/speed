import mongoose, { Schema, Document, Types, model } from "mongoose";

export interface INotification extends Document {
  targetId: Types.ObjectId;
  targetType: "Customer" | "Merchant" | "Driver" | "Admin";
  type:
    | "PAYMENT_SUCCESS"
    | "PAYMENT_FAILED"
    | "PAYMENT_EXPIRED"
    | "ORDER_ACCEPTED"
    | "ORDER_REJECTED"
    | "DRIVER_ASSIGNED"
    | "DRIVER_ARRIVED"
    | "ORDER_DELIVERED"
    | "ORDER_CANCELLED"
    | "NO_DRIVER_FOUND"
    | "NEW_ORDER"
    | "NEW_DELIVERY_OFFER"
    | "DRIVER_PICKED_UP"
    | "ADMIN_NEW_ORDER"
    | "ADMIN_NEW_MERCHANT"
    | "ADMIN_NEW_DRIVER"
    | "ADMIN_NEW_REVIEW";
  title: string;
  message: string;
  order: Types.ObjectId | null;
  isRead: boolean;
}

export type CreateNotificationInput = {
  targetId: Types.ObjectId;
  targetType: "Customer" | "Merchant" | "Driver" | "Admin";
  type: INotification["type"];
  title: string;
  message: string;
  order?: Types.ObjectId | null;
  isRead?: boolean;
};

const notificationSchema = new Schema<INotification>(
  {
    targetId: {
      type: mongoose.Types.ObjectId,
      refPath: function (this: INotification) {
        return this.targetType === "Admin" ? "User" : this.targetType;
      },
      required: true,
    },
    targetType: {
      type: String,
      required: true,
      enum: ["Customer", "Merchant", "Driver", "Admin"],
    },
    type: {
      type: String,
      required: true,
      enum: [
        "PAYMENT_SUCCESS",
        "PAYMENT_FAILED",
        "PAYMENT_EXPIRED",
        "ORDER_ACCEPTED",
        "ORDER_REJECTED",
        "DRIVER_ASSIGNED",
        "DRIVER_ARRIVED",
        "ORDER_DELIVERED",
        "ORDER_CANCELLED",
        "NO_DRIVER_FOUND",
        "NEW_ORDER",
        "NEW_DELIVERY_OFFER",
        "DRIVER_PICKED_UP",
        "ADMIN_NEW_ORDER",
        "ADMIN_NEW_MERCHANT",
        "ADMIN_NEW_DRIVER",
        "ADMIN_NEW_REVIEW",
      ],
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    order: {
      type: mongoose.Types.ObjectId,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Notification = model<INotification>("Notification", notificationSchema);
export default Notification;

import axios from "axios";
import { PAYMONGO_SECRET_KEY } from "../config/envVars.js";
import {
  prepareOrderData,
  type PreparedOrderDataType,
} from "./order.service.js";
import Payment from "../models/payment.model.js";
import { ConflictError, NotFoundError } from "../utils/errors.js";
import mongoose from "mongoose";
import Order, { type IOrder } from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import { generateOrderNumber } from "../utils/generateOrderNumber.js";
import { driverMatching } from "./driver.service.js";
import { ApiError } from "../utils/apiError.js";
import type { CreateNotificationInput } from "../models/notification.model.js";
import { createNotification } from "./notification.service.js";

export const createCheckoutService = async (userId: string) => {
  const preparedData = await prepareOrderData(userId);

  if (!preparedData) {
    throw new NotFoundError("Order data");
  }

  const intentData = await createPaymentIntent(
    preparedData.orderData.pricing.total,
    "QRPh Payment",
  );

  const payment = new Payment({
    customer: preparedData.orderData.customer,
    merchant: preparedData.orderData.merchant,
    cart: preparedData.cart._id,
    orderData: {
      items: preparedData.orderData.items,
      deliveryAddress: preparedData.orderData.deliveryAddress,
      pricing: preparedData.orderData.pricing,
      customerNote: preparedData.orderData.customerNote,
      estimatedPreparationTime: preparedData.orderData.estimatedPreparationTime,
      estimatedDeliveryTime: preparedData.orderData.estimatedDeliveryTime,
    },
    provider: "Paymongo",
    method: "QRPh",
    amount: preparedData.orderData.pricing.total,
    status: "Pending",
    paymentIntentId: intentData.id,
    transactionId: null,
    paidAt: null,
    expiresAt: new Date(Date.now() + 180 * 1000),
    expiredAt: null,
    refundedAt: null,
  });

  await payment.save();

  return {
    paymentId: payment._id,
    paymentIntentId: payment.paymentIntentId,
    clientKey: intentData.clientKey,
    expiresAt: payment.expiresAt,
  };
};

export const handleSuccessfulPaymentService = async (
  paymentIntentId: string,
  transactionId: string,
) => {
  const payment = await Payment.findOne({ paymentIntentId });

  if (!payment) {
    throw new NotFoundError("Payment");
  }

  if (payment.status === "Paid") {
    if (!payment.order) {
      throw new ConflictError("Paid payment has no associated order");
    }

    const existingOrder = await Order.findById(payment.order);

    if (!existingOrder) {
      throw new NotFoundError("Order");
    }

    return existingOrder;
  }

  if (payment.status !== "Pending") {
    throw new ConflictError(
      `Payment cannot be marked as paid because its current status is ${payment.status}`,
    );
  }

  const orderData: PreparedOrderDataType = {
    customer: payment.customer,
    merchant: payment.merchant,
    items: payment.orderData.items,
    deliveryAddress: payment.orderData.deliveryAddress,
    payment: {
      paymentId: payment._id,
      method: payment.method,
      status: "Paid",
      transactionId,
    },
    pricing: payment.orderData.pricing,
    status: "Pending",
    customerNote: payment.orderData.customerNote ?? "",
    estimatedPreparationTime: payment.orderData.estimatedPreparationTime,
    estimatedDeliveryTime: payment.orderData.estimatedDeliveryTime,
    driver: null,
  };

  const session = await mongoose.startSession();
  let newOrder: IOrder | undefined;

  try {
    await session.withTransaction(async () => {
      newOrder = new Order(orderData);
      newOrder.orderNumber = generateOrderNumber();

      await newOrder.save({ session });

      payment.order = newOrder._id;
      payment.status = "Paid";
      payment.transactionId = transactionId;
      payment.paidAt = new Date();

      await payment.save({ session });

      await Cart.findByIdAndDelete(payment.cart).session(session);
    });
  } finally {
    await session.endSession();
  }
  if (!newOrder) {
    throw new Error("Order was not created");
  }

  const notificationDataCustomer: CreateNotificationInput = {
    targetId: newOrder.customer!,
    targetType: "Customer",
    type: "PAYMENT_SUCCESS",
    title: "Payment successful",
    message: "Your payment has been successfully processed",
    order: newOrder._id!,
    isRead: false,
  };

  await createNotification(notificationDataCustomer);

  const order = await driverMatching(newOrder!._id.toString());

  if (!order) {
    throw new NotFoundError("Order");
  }

  return order;
};

export const handleFailedPaymentService = async (paymentIntentId: string) => {
  const payment = await Payment.findOne({ paymentIntentId });

  if (!payment) {
    throw new NotFoundError("Payment");
  }

  if (payment.status === "Failed") {
    return payment;
  }

  if (payment.status === "Paid") {
    return payment;
  }

  if (payment.status !== "Pending") {
    throw new ConflictError(
      `Payment cannot be marked as failed because its current status is ${payment.status}`,
    );
  }

  payment.status = "Failed";

  await payment.save();

  return payment;
};

export const handleExpiredQRPhPaymentService = async (
  paymentIntentId: string,
) => {
  const payment = await Payment.findOne({ paymentIntentId });

  if (!payment) {
    throw new NotFoundError("Payment");
  }

  if (payment.status === "Failed") {
    return payment;
  }

  if (payment.status === "Paid") {
    return payment;
  }

  if (payment.status === "Expired") {
    return payment;
  }

  if (payment.status !== "Pending") {
    throw new ConflictError(
      `Payment cannot be marked as expired because its current status is ${payment.status}`,
    );
  }

  payment.status = "Expired";
  payment.expiredAt = new Date();

  await payment.save();

  return payment;
};

const createPaymentIntent = async (
  amount: number,
  description = "Order payment",
) => {
  try {
    const response = await axios.post(
      "https://api.paymongo.com/v1/payment_intents",
      {
        data: {
          attributes: {
            amount: amount,
            currency: "PHP",
            payment_method_allowed: ["qrph"],
            description: description,
            expiry_seconds: 180,
          },
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(
            PAYMONGO_SECRET_KEY + ":",
          ).toString("base64")}`,
        },
      },
    );

    const intent = response.data.data;
    return {
      id: intent.id,
      clientKey: intent.attributes.client_key,
      status: intent.attributes.status,
      amount: intent.attributes.amount,
    };
  } catch (error: any) {
    console.error("PayMongo error:", error.response?.data || error.message);
    throw new Error("Failed to create payment intent");
  }
};

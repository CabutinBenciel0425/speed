import axios from "axios";
import { PAYMONGO_SECRET_KEY } from "../config/envVars.js";
import { prepareOrderData } from "./order.service.js";
import Payment from "../models/payment.model.js";
import { NotFoundError } from "../utils/errors.js";

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

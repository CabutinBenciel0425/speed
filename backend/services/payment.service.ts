import axios from "axios";
import { createHash } from "crypto";
import { PAYMONGO_PUBLIC_KEY, PAYMONGO_SECRET_KEY } from "../config/envVars.js";
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
import { io } from "../server.js";

const QRPH_EXPIRY_SECONDS = 900;

export const createCheckoutService = async (userId: string) => {
  const preparedData = await prepareOrderData(userId);

  if (!preparedData) {
    throw new NotFoundError("Order data");
  }

  if (preparedData.orderData.pricing.total < 1) {
    throw new ConflictError("QR Ph payments must be at least ₱1.00");
  }

  const existingPayment = await Payment.findOne({
    customer: userId,
    cart: preparedData.cart._id,
    method: "QRPh",
  }).sort({ createdAt: -1 });

  if (existingPayment) {
    if (existingPayment.status === "Processing") {
      throw new ConflictError(
        "Payment confirmation is processing. Please wait for the result.",
      );
    }

    if (
      existingPayment.status === "Pending" &&
      existingPayment.expiresAt > new Date() &&
      existingPayment.qrCodeImage
    ) {
      return toQRPhResponse(existingPayment);
    }

    if (
      existingPayment.status === "GeneratingQR" &&
      existingPayment.clientKey
    ) {
      return await generateQRForPayment(
        existingPayment,
        existingPayment.qrAttempt ?? 1,
      );
    }

    if (["Pending", "Expired", "Failed"].includes(existingPayment.status)) {
      const intent = await retrievePaymentIntent(
        existingPayment.paymentIntentId!,
      );
      if (intent.status === "processing" || intent.status === "succeeded") {
        throw new ConflictError(
          "Payment is being confirmed. Please wait before requesting another QR code.",
        );
      }
      if (!isQRReadyForRetry(intent)) {
        throw new ConflictError(
          "The payment provider has not confirmed that this QR code expired yet. Please check payment status and try again.",
        );
      }

      const nextAttempt = (existingPayment.qrAttempt ?? 1) + 1;
      const generating = await Payment.findOneAndUpdate(
        { _id: existingPayment._id, status: existingPayment.status },
        {
          $set: {
            status: "GeneratingQR",
            qrAttempt: nextAttempt,
            paymentMethodId: null,
            qrCodeImage: null,
            expiresAt: new Date(Date.now() + QRPH_EXPIRY_SECONDS * 1000),
            expiredAt: null,
          },
        },
        { new: true },
      );
      if (!generating)
        throw new ConflictError(
          "Payment status changed. Please check the latest payment status.",
        );
      return await generateQRForPayment(generating, nextAttempt);
    }

    if (existingPayment.status === "Paid") {
      throw new ConflictError("This payment was already completed.");
    }
  }

  const checkoutKey = createHash("sha256")
    .update(
      JSON.stringify({
        customer: userId,
        cart: preparedData.cart._id.toString(),
        address: preparedData.orderData.deliveryAddress.address.toString(),
        total: preparedData.orderData.pricing.total,
        items: preparedData.orderData.items.map((item) => [
          item.product.toString(),
          item.quantity,
          item.notes,
        ]),
      }),
    )
    .digest("hex");

  const intentData = await createPaymentIntent(
    Math.round(preparedData.orderData.pricing.total * 100),
    "QRPh Payment",
    `qrph-intent-${checkoutKey}`,
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
    status: "GeneratingQR",
    qrAttempt: 1,
    paymentIntentId: intentData.id,
    clientKey: intentData.clientKey,
    transactionId: null,
    paidAt: null,
    expiresAt: new Date(Date.now() + QRPH_EXPIRY_SECONDS * 1000),
    expiredAt: null,
    refundedAt: null,
  });

  await payment.save();

  return await generateQRForPayment(payment, 1);
};

const generateQRForPayment = async (
  payment: InstanceType<typeof Payment>,
  attempt: number,
) => {
  if (!payment.clientKey || !payment.paymentIntentId)
    throw new ConflictError(
      "Payment setup is incomplete. Please retry checkout.",
    );
  try {
    const qrCodeImage = await attachQRPhPaymentMethod(
      payment.paymentIntentId,
      payment.clientKey,
      payment.paymentMethodId ?? undefined,
      async (paymentMethodId) => {
        await Payment.updateOne(
          { _id: payment._id, status: "GeneratingQR", qrAttempt: attempt },
          { $set: { paymentMethodId } },
        );
        payment.paymentMethodId = paymentMethodId;
      },
      attempt,
    );
    const updated = await Payment.findOneAndUpdate(
      { _id: payment._id, status: "GeneratingQR", qrAttempt: attempt },
      {
        $set: {
          qrCodeImage,
          status: "Pending",
          expiresAt: new Date(Date.now() + QRPH_EXPIRY_SECONDS * 1000),
        },
      },
      { new: true },
    );
    if (!updated)
      throw new ConflictError(
        "Payment status changed while generating a QR code. Please check payment status.",
      );
    return toQRPhResponse(updated);
  } catch (error) {
    const current = await Payment.findById(payment._id);
    if (current?.status === "GeneratingQR" && !current.paymentMethodId) {
      await Payment.updateOne(
        { _id: payment._id, status: "GeneratingQR", qrAttempt: attempt },
        { $set: { status: "Expired", expiredAt: new Date() } },
      );
    }
    throw error;
  }
};

const toQRPhResponse = (payment: InstanceType<typeof Payment>) => ({
  paymentId: payment._id,
  paymentIntentId: payment.paymentIntentId,
  qrCodeImage: payment.qrCodeImage!,
  amount: payment.amount,
  expiresAt: payment.expiresAt,
});

export const handleSuccessfulPaymentService = async (
  paymentIntentId: string,
  transactionId: string,
  amountInCentavos?: number,
) => {
  let payment = await Payment.findOne({ paymentIntentId });

  if (!payment) {
    throw new NotFoundError("Payment");
  }

  if (
    amountInCentavos !== undefined &&
    amountInCentavos !== Math.round(payment.amount * 100)
  ) {
    throw new ConflictError("Payment amount does not match the checkout");
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

  if (!["Pending", "GeneratingQR", "Processing"].includes(payment.status)) {
    throw new ConflictError(
      `Payment cannot be marked as paid because its current status is ${payment.status}`,
    );
  }

  const staleProcessingBefore = new Date(Date.now() - 2 * 60 * 1000);
  const claimedPayment = await Payment.findOneAndUpdate(
    {
      _id: payment._id,
      $or: [
        { status: "Pending" },
        { status: "GeneratingQR" },
        { status: "Processing", processingAt: { $lt: staleProcessingBefore } },
      ],
    },
    { $set: { status: "Processing", processingAt: new Date() } },
    { new: true },
  );

  if (!claimedPayment) {
    payment = await Payment.findById(payment._id);
    if (payment?.status === "Paid" && payment.order) {
      const existingOrder = await Order.findById(payment.order);
      if (existingOrder) return existingOrder;
    }
    throw new ConflictError("Payment confirmation is already being processed");
  }
  payment = claimedPayment;

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
      payment.processingAt = null;
      payment.transactionId = transactionId;
      payment.paidAt = new Date();

      await payment.save({ session });

      await Cart.findByIdAndDelete(payment.cart).session(session);
    });
  } catch (error) {
    await Payment.updateOne(
      { _id: payment._id, status: "Processing" },
      { $set: { status: "Pending", processingAt: null } },
    );
    throw error;
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

  await createNotification({
    targetId: newOrder.merchant,
    targetType: "Merchant",
    type: "NEW_ORDER",
    title: "New order received",
    message: `Order #${newOrder.orderNumber} is ready for your review.`,
    order: newOrder._id,
  });
  io.to(`merchant:${newOrder.merchant.toString()}`).emit("order:new", {
    orderId: newOrder._id.toString(),
  });

  void driverMatching(newOrder._id.toString()).catch((error) => {
    console.error("Driver matching failed", error);
  });

  return newOrder;
};

export const syncQRPhPaymentStatusService = async (
  userId: string,
  paymentId: string,
) => {
  const payment = await Payment.findOne({
    _id: paymentId,
    customer: userId,
    method: "QRPh",
  });
  if (!payment) throw new NotFoundError("Payment");
  if (payment.status !== "Pending" || !payment.paymentIntentId) return payment;

  const intent = await retrievePaymentIntent(payment.paymentIntentId);
  if (intent.status === "succeeded") {
    const paidPayment = intent.payments.find(
      (attempt) => attempt.status === "paid",
    );
    const successfulAttempt = paidPayment ?? intent.payments[0];
    if (!successfulAttempt?.id) {
      throw new ConflictError(
        "PayMongo confirmed payment but did not return its payment record. Please retry status check.",
      );
    }
    await handleSuccessfulPaymentService(
      payment.paymentIntentId,
      successfulAttempt.id,
      successfulAttempt.amount,
    );
    return (await Payment.findById(payment._id)) ?? payment;
  }

  if (payment.expiresAt <= new Date() && isQRReadyForRetry(intent)) {
    return (
      (await Payment.findOneAndUpdate(
        { _id: payment._id, status: "Pending" },
        {
          $set: {
            status: "Expired",
            expiredAt: new Date(),
            qrCodeImage: null,
            paymentMethodId: null,
          },
        },
        { new: true },
      )) ?? payment
    );
  }

  return payment;
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
    if (payment.status === "GeneratingQR" || payment.status === "Processing") {
      return payment;
    }
    throw new ConflictError(
      `Payment cannot be marked as failed because its current status is ${payment.status}`,
    );
  }

  const intent = await retrievePaymentIntent(paymentIntentId);
  if (!isQRReadyForRetry(intent)) return payment;

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
    if (payment.status === "GeneratingQR" || payment.status === "Processing") {
      return payment;
    }
    throw new ConflictError(
      `Payment cannot be marked as expired because its current status is ${payment.status}`,
    );
  }

  // PayMongo may deliver an expiry event for an older QR after a replacement
  // QR was attached to this same intent. Only expire it when the intent is
  // actually waiting for a new payment method.
  const intent = await retrievePaymentIntent(paymentIntentId);
  if (!isQRReadyForRetry(intent)) return payment;

  payment.status = "Expired";
  payment.expiredAt = new Date();
  payment.qrCodeImage = null;
  payment.paymentMethodId = null;

  await payment.save();

  return payment;
};

const createPaymentIntent = async (
  amount: number,
  description = "Order payment",
  idempotencyKey: string,
) => {
  if (!PAYMONGO_SECRET_KEY) {
    throw new ApiError(503, "QR Ph payment is not configured.");
  }
  try {
    const response = await axios.post(
      "https://api.paymongo.com/v1/payment_intents",
      {
        data: {
          attributes: {
            amount,
            currency: "PHP",
            payment_method_allowed: ["qrph"],
            description: description,
          },
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
          Authorization: `Basic ${Buffer.from(
            PAYMONGO_SECRET_KEY + ":",
          ).toString("base64")}`,
        },
        timeout: 25_000,
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
    throw new ApiError(502, "Could not start QR Ph payment. Please try again.");
  }
};

const retrievePaymentIntent = async (paymentIntentId: string) => {
  if (!PAYMONGO_SECRET_KEY)
    throw new ApiError(503, "QR Ph payment is not configured.");
  try {
    const response = await axios.get(
      `https://api.paymongo.com/v1/payment_intents/${paymentIntentId}`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${PAYMONGO_SECRET_KEY}:`).toString("base64")}`,
        },
        timeout: 25_000,
      },
    );
    const attributes = response.data.data.attributes;
    return {
      status: attributes.status as string,
      qrExpiresAt: attributes.next_action?.code?.expires_at as
        string | undefined,
      payments: (attributes.payments ?? []) as Array<{
        id?: string;
        status?: string;
        amount?: number;
      }>,
    };
  } catch (error: any) {
    console.error(
      "PayMongo intent lookup error:",
      error.response?.data || error.message,
    );
    throw new ApiError(
      502,
      "Could not verify QR Ph payment status. Please try again.",
    );
  }
};

const isQRReadyForRetry = (intent: {
  status: string;
  qrExpiresAt?: string;
  payments: Array<{ id?: string; status?: string; amount?: number }>;
}) => {
  if (intent.status === "awaiting_payment_method") return true;
  // Test mode can leave the intent at awaiting_next_action after its QR source
  // expires. The QR expiry timestamp plus an empty payments list is the
  // provider evidence that this attempt can be retried safely.
  if (intent.status !== "awaiting_next_action" || intent.payments.length > 0) {
    return false;
  }
  const expiresAt = intent.qrExpiresAt
    ? new Date(intent.qrExpiresAt).getTime()
    : Number.NaN;
  return Number.isFinite(expiresAt) && expiresAt <= Date.now();
};

const attachQRPhPaymentMethod = async (
  paymentIntentId: string,
  clientKey: string,
  existingPaymentMethodId?: string,
  onPaymentMethodCreated?: (paymentMethodId: string) => Promise<void>,
  attempt = 1,
) => {
  if (!PAYMONGO_PUBLIC_KEY) {
    throw new ApiError(503, "QR Ph payment is not configured.");
  }

  const authorization = `Basic ${Buffer.from(
    `${PAYMONGO_PUBLIC_KEY}:`,
  ).toString("base64")}`;
  const idempotencyKey = createHash("sha256")
    .update(`${paymentIntentId}:${attempt}`)
    .digest("hex");

  try {
    const methodResponse = existingPaymentMethodId
      ? null
      : await axios.post(
          "https://api.paymongo.com/v1/payment_methods",
          {
            data: {
              attributes: {
                type: "qrph",
                expiry_seconds: QRPH_EXPIRY_SECONDS,
              },
            },
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: authorization,
              "Idempotency-Key": `qrph-method-${idempotencyKey}`,
            },
            timeout: 25_000,
          },
        );
    const paymentMethodId =
      existingPaymentMethodId ??
      (methodResponse?.data.data.id as string | undefined);
    if (!paymentMethodId) throw new Error("Missing QR Ph payment method ID");
    if (!existingPaymentMethodId)
      await onPaymentMethodCreated?.(paymentMethodId);

    const attachResponse = await axios.post(
      `https://api.paymongo.com/v1/payment_intents/${paymentIntentId}/attach`,
      {
        data: {
          attributes: {
            payment_method: paymentMethodId,
            client_key: clientKey,
          },
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: authorization,
          "Idempotency-Key": `qrph-attach-${idempotencyKey}`,
        },
        timeout: 25_000,
      },
    );

    const imageUrl = attachResponse.data.data.attributes.next_action?.code
      ?.image_url as string | undefined;
    if (!imageUrl) throw new Error("PayMongo did not return a QR code");
    return imageUrl;
  } catch (error: any) {
    if (existingPaymentMethodId) {
      try {
        const intentResponse = await axios.get(
          `https://api.paymongo.com/v1/payment_intents/${paymentIntentId}`,
          {
            headers: {
              Authorization: `Basic ${Buffer.from(`${PAYMONGO_SECRET_KEY}:`).toString("base64")}`,
            },
            timeout: 25_000,
          },
        );
        const imageUrl = intentResponse.data.data.attributes.next_action?.code
          ?.image_url as string | undefined;
        if (imageUrl) return imageUrl;
      } catch {
        // Preserve the attach error; a later checkout retry can try recovery again.
      }
    }
    console.error(
      "PayMongo QR Ph setup error:",
      error.response?.data || error.message,
    );
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      502,
      "Could not generate the QR code. Please try again.",
    );
  }
};

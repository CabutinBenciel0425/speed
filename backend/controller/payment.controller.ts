import { asyncHandler } from "../utils/asyncHandler.js";
import crypto from "crypto";
import type { Request, Response } from "express";
import { UnauthorizedError } from "../utils/errors.js";
import {
  createCheckoutService,
  handleExpiredQRPhPaymentService,
  handleFailedPaymentService,
  handleSuccessfulPaymentService,
  syncQRPhPaymentStatusService,
} from "../services/payment.service.js";
import { PAYMONGO_WEBHOOK_SECRET } from "../config/envVars.js";
import Payment from "../models/payment.model.js";
import Cart from "../models/cart.model.js";

export const createCheckout = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;

    if (!user) {
      throw new UnauthorizedError("Unauthorized user");
    }

    const newPayment = await createCheckoutService(user._id.toString());

    res.status(200).json({
      success: true,
      data: newPayment,
    });
  },
);

export const paymongoWebhook = asyncHandler(
  async (req: Request, res: Response) => {
    const secret = PAYMONGO_WEBHOOK_SECRET;

    if (!secret) {
      throw new Error(
        "PAYMONGO_WEBHOOK_SECRET is required in environment variables",
      );
    }

    const rawBody = req.body as Buffer;

    const signatureHeader = req.headers["paymongo-signature"];

    if (!signatureHeader || Array.isArray(signatureHeader)) {
      return res.status(401).send("Missing signature");
    }

    const parts = signatureHeader.split(",");

    const timestamp = parts
      .find((part) => part.startsWith("t="))
      ?.split("=")[1];

    const testSignature = parts
      .find((part) => part.startsWith("te="))
      ?.split("=")[1];

    const liveSignature = parts
      .find((part) => part.startsWith("li="))
      ?.split("=")[1];

    if (!timestamp) {
      return res.status(401).send("Invalid signature: missing timestamp");
    }

    const signatureToCompare = testSignature || liveSignature;

    if (!signatureToCompare) {
      return res.status(401).send("Invalid signature: missing signature");
    }

    const signaturePayload = `${timestamp}.${rawBody.toString("utf8")}`;

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(signaturePayload)
      .digest("hex");

    const receivedBuffer = Buffer.from(signatureToCompare, "hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");
    if (
      receivedBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(receivedBuffer, expectedBuffer)
    ) {
      console.error("Invalid webhook signature");
      return res.status(401).send("Invalid signature");
    }

    const event = JSON.parse(rawBody.toString("utf8"));

    const eventType = event.data?.type;

    const paymentData = event.data?.attributes?.data;
    const paymentAttributes = paymentData?.attributes;

    switch (eventType) {
      case "payment.paid": {
        const paymentIntentId = paymentAttributes?.payment_intent_id;
        const transactionId = paymentData?.id;
        const amount = paymentAttributes?.amount;

        if (!paymentIntentId || !transactionId || typeof amount !== "number") {
          return res.status(400).json({
            success: false,
            message: "Missing payment confirmation details",
          });
        }

        const order = await handleSuccessfulPaymentService(
          paymentIntentId,
          transactionId,
          amount,
        );

        return res.status(200).json({
          success: true,
          data: {
            orderId: order._id,
            orderNumber: order.orderNumber,
            status: order.status,
          },
        });
      }

      case "payment.failed": {
        const paymentIntentId = paymentAttributes?.payment_intent_id;
        if (!paymentIntentId) return res.status(200).json({ success: true });

        const payment = await handleFailedPaymentService(paymentIntentId);

        return res.status(200).json({
          success: true,
          message: "Payment failed",
          data: payment,
        });
      }

      case "qrph.expired": {
        const paymentIntentId = paymentAttributes?.payment_intent_id;
        if (!paymentIntentId) return res.status(200).json({ success: true });

        const payment = await handleExpiredQRPhPaymentService(paymentIntentId);

        return res.status(200).json({
          success: true,
          message: "QR expired",
          data: payment,
        });
      }

      case "payment.refunded": {
        break;
      }

      default: {
        return res.status(200).json({ success: true, ignored: true });
      }
    }
  },
);

export const paymentsHistory = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;

    if (!user) {
      throw new UnauthorizedError("Unauthorized user");
    }

    const payments = await Payment.find({ customer: user._id.toString() });

    res.status(200).json({
      success: true,
      data: payments,
    });
  },
);

export const getPayment = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const paymentId = req.params.paymentId as string;

  if (!user) {
    throw new UnauthorizedError("Unauthorized user");
  }

  const payment = await syncQRPhPaymentStatusService(
    user._id.toString(),
    paymentId,
  );

  res.status(200).json({
    success: true,
    data: payment,
  });
});

export const getPendingQRPhPayment = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) throw new UnauthorizedError("Unauthorized user");

    const recentPaymentCutoff = new Date(Date.now() - 15 * 60 * 1000);
    const cart = await Cart.findOne({ customer: user._id }).select("_id");
    const activePayment = cart
      ? await Payment.findOne({
          customer: user._id,
          cart: cart._id,
          method: "QRPh",
          status: {
            $in: ["Pending", "GeneratingQR", "Processing"] as const,
          },
        }).sort({ createdAt: -1 })
      : null;
    const recentPaidPayment = await Payment.findOne({
      customer: user._id,
      method: "QRPh",
      status: "Paid",
      paidAt: { $gte: recentPaymentCutoff },
    }).sort({ createdAt: -1 });
    const payment = activePayment ?? recentPaidPayment;

    res.status(200).json({
      success: true,
      data: payment
        ? {
            paymentId: payment._id,
            paymentIntentId: payment.paymentIntentId,
            qrCodeImage: payment.qrCodeImage,
            amount: payment.amount,
            expiresAt: payment.expiresAt,
            status: payment.status,
          }
        : null,
    });
  },
);

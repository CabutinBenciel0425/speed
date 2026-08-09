import express, { Router } from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
  createCheckout,
  paymongoWebhook,
} from "../controller/payment.controller.js";

const paymentRouter = Router();

// POST /payments/checkout
paymentRouter.post("/checkout/qrph", protectRoute, createCheckout);

// POST /payments/webhook

// GET /payments/history

// GET /payments/:paymentId

export default paymentRouter;

import express, { Router } from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { createCheckout } from "../controller/payment.controller.js";

const paymentRouter = Router();

paymentRouter.post("/checkout/qrph", protectRoute, createCheckout);

paymentRouter.post("/history", protectRoute, createCheckout);

paymentRouter.post("/:paymentId", protectRoute, createCheckout);

export default paymentRouter;

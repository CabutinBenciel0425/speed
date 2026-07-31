import { Router } from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
  createOrder,
  getOrders,
  getOrder,
} from "../controller/order.controller.js";

const orderRouter = Router();

orderRouter.post("/", protectRoute, createOrder);
orderRouter.get("/", protectRoute, getOrders);
orderRouter.post("/:orderId", protectRoute, getOrder);
// orderRouter.patch("/:orderId/cancel", protectRoute, cancelOrder);

export default orderRouter;

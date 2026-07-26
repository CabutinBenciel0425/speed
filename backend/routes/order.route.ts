import { Router } from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createOrderSchema } from "../schemas/order.schema.js";
import {
  createOrder,
  getOrders,
  getOrder,
  cancelOrder,
} from "../controller/order.controller.js";

const orderRouter = Router();

orderRouter.post("/", protectRoute, validate(createOrderSchema), createOrder);
orderRouter.get("/", protectRoute, getOrders);
orderRouter.post("/:orderId", protectRoute, getOrder);
orderRouter.patch("/:orderId/cancel", protectRoute, cancelOrder);

export default orderRouter;

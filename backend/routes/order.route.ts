import { Router } from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createOrderSchema } from "../schemas/order.schema.js";
import { createOrder } from "../controller/order.controller.js";

const orderRouter = Router();

orderRouter.post("/", protectRoute, validate(createOrderSchema), createOrder);

export default orderRouter;

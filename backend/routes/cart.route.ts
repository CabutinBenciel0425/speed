import { Router } from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { itemSchema } from "../schemas/cart.schema.js";
import { addToCart } from "../controller/cart.controller.js";

const cartRouter = Router();

cartRouter.post("/", protectRoute, validate(itemSchema), addToCart);

export default cartRouter;

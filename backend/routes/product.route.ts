import { Router } from "express";
import { merchantOnly, protectRoute } from "../middlewares/auth.middleware.js";
import { addProduct } from "../controller/product.controller.js";
import { productSchema } from "../schemas/product.schema.js";
import { validate } from "../middlewares/validate.middleware.js";

const productRouter = Router();

productRouter.post(
  "/:id",
  validate(productSchema),
  protectRoute,
  merchantOnly,
  addProduct,
);

//use UserDocument on user parameters

export default productRouter;

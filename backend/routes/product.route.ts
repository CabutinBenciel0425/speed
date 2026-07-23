import { Router } from "express";
import { merchantOnly, protectRoute } from "../middlewares/auth.middleware.js";
import {
  addProduct,
  updateProduct,
  toggleAvailability,
  toggleFeatured,
  deleteProduct,
} from "../controller/product.controller.js";
import {
  productSchema,
  productSchemaUpdate,
} from "../schemas/product.schema.js";
import { validate } from "../middlewares/validate.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const productRouter = Router();

productRouter.post(
  "/:merchantId",
  protectRoute,
  merchantOnly,
  upload.single("image"),
  validate(productSchema),
  addProduct,
);

productRouter.patch(
  "/:merchantId/:id/availability/status",
  protectRoute,
  merchantOnly,
  toggleAvailability,
);

productRouter.patch(
  "/:merchantId/:id/featured/status",
  protectRoute,
  merchantOnly,
  toggleFeatured,
);

productRouter.patch(
  "/:merchantId/:id",
  protectRoute,
  merchantOnly,
  upload.single("image"),
  validate(productSchemaUpdate),
  updateProduct,
);

productRouter.delete(
  "/:merchantId/:id",
  protectRoute,
  merchantOnly,
  deleteProduct,
);

export default productRouter;

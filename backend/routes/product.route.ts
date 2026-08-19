import { Router } from "express";
import { merchantOnly, protectRoute } from "../middlewares/auth.middleware.js";
import {
  addProduct,
  updateProduct,
  toggleAvailability,
  toggleFeatured,
  deleteProduct,
  getProducts,
  toggleProductFavorite,
  getProductFavorites,
  getFeaturedProducts,
} from "../controller/product.controller.js";
import {
  productSchema,
  productSchemaUpdate,
} from "../schemas/product.schema.js";
import { validate } from "../middlewares/validate.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const productRouter = Router();

//public routes
productRouter.get("/featured", getFeaturedProducts);

//merchant routes
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

productRouter.get("/products", protectRoute, merchantOnly, getProducts);

//customer routes
productRouter.patch(
  "/favorites/:productId/status",
  protectRoute,
  toggleProductFavorite,
);

productRouter.get("/favorites", protectRoute, getProductFavorites);

export default productRouter;

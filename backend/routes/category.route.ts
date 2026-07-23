import { protectRoute, adminOnly } from "./../middlewares/auth.middleware.js";
import { Router } from "express";
import {
  allCategory,
  createCategory,
  toggleIsActive,
  updateCategory,
} from "../controller/category.controller.js";
import { upload } from "../middlewares/upload.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  categoryUpdateSchema,
  createCategorySchema,
} from "../schemas/category.schema.js";

const categoryRouter = Router();

categoryRouter.get("/", protectRoute, adminOnly, allCategory);

categoryRouter.post(
  "/create",
  protectRoute,
  adminOnly,
  upload.single("image"),
  validate(createCategorySchema),
  createCategory,
);

categoryRouter.patch(
  "/:id",
  protectRoute,
  adminOnly,
  upload.single("image"),
  validate(categoryUpdateSchema),
  updateCategory,
);

categoryRouter.get("/:id/status", protectRoute, adminOnly, toggleIsActive);

export default categoryRouter;

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
  validate(createCategorySchema),
  upload.single("image"),
  protectRoute,
  adminOnly,
  createCategory,
);

categoryRouter.patch(
  "/:id",
  validate(categoryUpdateSchema),
  upload.single("image"),
  protectRoute,
  adminOnly,
  updateCategory,
);

categoryRouter.get("/:id/status", protectRoute, adminOnly, toggleIsActive);

export default categoryRouter;

import { protectRoute, adminOnly } from "./../middlewares/auth.middleware.js";
import { Router } from "express";
import {
  allCategory,
  createCategory,
  toggleIsActive,
  updateCategory,
} from "../controller/category.controller.js";
import { upload } from "../middlewares/upload.middleware.js";

const categoryRouter = Router();

categoryRouter.get("/", protectRoute, adminOnly, allCategory);

categoryRouter.post(
  "/create",
  upload.single("image"),
  protectRoute,
  adminOnly,
  createCategory,
);

categoryRouter.patch(
  "/:id",
  upload.single("image"),
  protectRoute,
  adminOnly,
  updateCategory,
);

categoryRouter.get("/:id/status", protectRoute, adminOnly, toggleIsActive);

export default categoryRouter;

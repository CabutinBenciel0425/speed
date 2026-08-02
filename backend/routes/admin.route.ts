import { Router } from "express";
import { adminOnly, protectRoute } from "../middlewares/auth.middleware.js";

const adminRouter = Router();

export default adminRouter;

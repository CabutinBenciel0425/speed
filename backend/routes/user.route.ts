import { Router } from "express";
import {
  login,
  logout,
  customerSignup,
  myProfile,
  userProfile,
  recreateAccessToken,
  forgotPassword,
  resetPassword,
} from "../controller/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { loginSchema, signupSchema } from "../schemas/user.schema.js";
import { adminOnly, protectRoute } from "../middlewares/auth.middleware.js";

export const userRoute = Router();

//public routes
userRoute.post("/sign-up/customer", validate(signupSchema), customerSignup);

userRoute.post("/login", validate(loginSchema), login);

//user routes
userRoute.post("/logout", protectRoute, logout);
userRoute.get("/profile", protectRoute, myProfile);
userRoute.post("/refresh", protectRoute, recreateAccessToken);
userRoute.patch("/forgot-password", forgotPassword);
userRoute.patch("/reset-password", protectRoute, resetPassword);

//admin only routes
userRoute.get("/profile/:id", protectRoute, adminOnly, userProfile);

//verify email, get all profiles by admin, delete a user by admin,

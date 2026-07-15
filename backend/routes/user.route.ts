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
  sendVerificationCode,
  codeVerification,
  deleteUser,
  updateUserDetails,
} from "../controller/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { loginSchema, signupSchema } from "../schemas/user.schema.js";
import { adminOnly, protectRoute } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
import type { Response } from "express";

export const userRoute = Router();

//public routes
userRoute.post(
  "/sign-up/customer",
  upload.single("avatar"),
  validate(signupSchema),
  customerSignup,
);

userRoute.post("/login", validate(loginSchema), login);

// userRoute.get("/test", () => {
//   console.log(`📅 Started at: ${new Date().toISOString()}`);
// });

//user routes
userRoute.post("/logout", protectRoute, logout);
userRoute.get("/profile", protectRoute, myProfile);
userRoute.post("/refresh", protectRoute, recreateAccessToken);
userRoute.patch("/forgot-password", forgotPassword);
userRoute.patch("/reset-password", protectRoute, resetPassword);
userRoute.post("/send-code", sendVerificationCode);
userRoute.post("/verify-code", codeVerification);
userRoute.delete("/:id", protectRoute, deleteUser);
userRoute.patch(
  "/update-user",
  upload.single("avatar"),
  protectRoute,
  updateUserDetails,
);

//admin only routes
userRoute.get("/profile/:id", protectRoute, adminOnly, userProfile);
//get all profiles by admin, delete a user by admin, update a user by admin

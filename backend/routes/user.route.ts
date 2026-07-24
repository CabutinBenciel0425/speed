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
  merchantSignup,
  driverSignup,
} from "../controller/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  loginSchema,
  signupSchema,
  updateSchema,
} from "../schemas/user.schema.js";
import { adminOnly, protectRoute } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
import { merchantSchema } from "../schemas/merchant.schema.js";
import { driverSchema } from "../schemas/driver.schema.js";

export const userRoute = Router();

userRoute.post(
  "/sign-up/customer",
  upload.single("avatar"),
  validate(signupSchema),
  customerSignup,
);

userRoute.post(
  "/sign-up/merchant",
  protectRoute,
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  validate(merchantSchema),
  merchantSignup,
);

userRoute.post(
  "/sign-up/driver",
  protectRoute,
  upload.single("avatar"),
  validate(driverSchema),
  driverSignup,
);

userRoute.post("/login", validate(loginSchema), login);

//user routes
userRoute.post("/logout", protectRoute, logout);
userRoute.get("/profile", protectRoute, myProfile);
userRoute.post("/refresh", recreateAccessToken);
userRoute.patch("/forgot-password", forgotPassword);
userRoute.patch("/reset-password", resetPassword);
userRoute.post("/send-code", protectRoute, sendVerificationCode);
userRoute.post("/verify-code", protectRoute, codeVerification);
userRoute.patch(
  "/update-user",
  protectRoute,
  upload.single("avatar"),
  validate(updateSchema),
  updateUserDetails,
);

//admin only routes
userRoute.get("/profile/:id", protectRoute, adminOnly, userProfile);
userRoute.delete("/:id", protectRoute, adminOnly, deleteUser);

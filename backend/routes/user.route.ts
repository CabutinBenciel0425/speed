import { Router } from "express";
import {
  login,
  logout,
  customerSignup,
  myProfile,
  recreateAccessToken,
  forgotPassword,
  resetPassword,
  sendVerificationCode,
  codeVerification,
  updateUserDetails,
  merchantSignup,
  driverSignup,
  selectRole,
} from "../controller/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
  updateSchema,
} from "../schemas/user.schema.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
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
userRoute.post("/select-role", selectRole);

//user routes
userRoute.post("/logout", protectRoute, logout);
userRoute.get("/profile", protectRoute, myProfile);
userRoute.post("/refresh", recreateAccessToken);
userRoute.patch(
  "/forgot-password",
  protectRoute,
  validate(forgotPasswordSchema),
  forgotPassword,
);
userRoute.patch(
  "/reset-password",
  protectRoute,
  validate(resetPasswordSchema),
  resetPassword,
);
userRoute.post("/send-code", protectRoute, sendVerificationCode);
userRoute.post("/verify-code", protectRoute, codeVerification);
userRoute.patch(
  "/update-user",
  protectRoute,
  upload.single("avatar"),
  validate(updateSchema),
  updateUserDetails,
);

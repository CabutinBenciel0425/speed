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
  getCustomerOrders,
  getFavoriteLists,
  getCustomerOrder,
} from "../controller/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  emailVerifySchema,
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
  updateSchema,
  verificationCodeSchema,
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
  validate(forgotPasswordSchema),
  forgotPassword,
);
userRoute.patch(
  "/reset-password",
  validate(resetPasswordSchema),
  resetPassword,
);
userRoute.post(
  "/send-code",
  protectRoute,
  validate(emailVerifySchema),
  sendVerificationCode,
);
userRoute.post(
  "/verify-code",
  protectRoute,
  validate(verificationCodeSchema),
  codeVerification,
);
userRoute.patch(
  "/update-user",
  protectRoute,
  upload.single("avatar"),
  validate(updateSchema),
  updateUserDetails,
);

userRoute.get("/:userId/orders", protectRoute, getCustomerOrders);
userRoute.get("/:userId/orders/:orderId", protectRoute, getCustomerOrder);

userRoute.get("/favorites/results", protectRoute, getFavoriteLists);

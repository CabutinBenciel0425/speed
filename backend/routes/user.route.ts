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
} from "../controller/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { loginSchema, signupSchema } from "../schemas/user.schema.js";
import { adminOnly, protectRoute } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
import { merchantSchema } from "../schemas/merchant.schema.js";

export const userRoute = Router();

//public routes
userRoute.post(
  "/sign-up/customer",
  upload.single("avatar"),
  validate(signupSchema),
  customerSignup,
);

userRoute.post(
  "/sign-up/merchant",
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  validate(merchantSchema),
  protectRoute,
  merchantSignup,
);

userRoute.get("/sign-up/test", () => {
  console.log("test endpoint");
});

userRoute.post("/login", validate(loginSchema), login);

//user routes
userRoute.post("/logout", protectRoute, logout);
userRoute.get("/profile", protectRoute, myProfile);
userRoute.post("/refresh", protectRoute, recreateAccessToken);
userRoute.patch("/forgot-password", forgotPassword);
userRoute.patch("/reset-password", protectRoute, resetPassword);
userRoute.post("/send-code", sendVerificationCode);
userRoute.post("/verify-code", codeVerification);
userRoute.patch(
  "/update-user",
  upload.single("avatar"),
  protectRoute,
  updateUserDetails,
);

//admin only routes
userRoute.get("/profile/:id", protectRoute, adminOnly, userProfile);
userRoute.delete("/:id", protectRoute, adminOnly, deleteUser);

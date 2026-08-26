import { CLIENT_URL, PORT } from "./config/envVars.js";
import { userRoute } from "./routes/user.route.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { notFoundMiddleware } from "./middlewares/notFound.middleware.js";
import { connectDB } from "./lib/db.js";
import { createDefaultAdmin } from "./scripts/seed-admin.js";
import { Server } from "socket.io";

import morgan from "morgan";
import cookieParser from "cookie-parser";
import express from "express";
import categoryRouter from "./routes/category.route.js";
import addressRouter from "./routes/address.route.js";
import productRouter from "./routes/product.route.js";
import orderRouter from "./routes/order.route.js";
import cartRouter from "./routes/cart.route.js";
import driverRouter from "./routes/driver.route.js";
import http from "http";
import { socketAuth } from "./middlewares/socketAuth.middleware.js";
import merchantRouter from "./routes/merchant.route.js";
import adminRouter from "./routes/admin.route.js";
import paymentRouter from "./routes/payment.route.js";
import { paymongoWebhook } from "./controller/payment.controller.js";
import notificationRouter from "./routes/notification.route.js";
import cors from "cors";
import searchRouter from "./routes/search.route.js";

const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: CLIENT_URL || "http://localhost:5173", // same as Socket.IO origin
    credentials: true, // if you use cookies
  }),
);

export const io = new Server(server, {
  cors: {
    origin: CLIENT_URL || "http://localhost:5173",
    credentials: true,
  },
});
io.use(socketAuth);
app.use(morgan("dev"));
app.post(
  "/api/v1/payment/webhook",
  express.raw({ type: "application/json" }),
  paymongoWebhook,
);
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());

app.use("/api/v1/auth", userRoute);
app.use("/api/v1/category", categoryRouter);
app.use("/api/v1/address", addressRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/driver", driverRouter);
app.use("/api/v1/merchant", merchantRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/payment", paymentRouter);
app.use("/api/v1/notification", notificationRouter);
app.use("/api/v1/search", searchRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

const startServer = async () => {
  await connectDB();
  await createDefaultAdmin();

  server.listen(PORT || 3000, () => {
    console.log(`Server running in port ${PORT}`);
  });
};

startServer();

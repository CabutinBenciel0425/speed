import { PORT } from "./config/envVars.js";
import { userRoute } from "./routes/user.route.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { notFoundMiddleware } from "./middlewares/notFound.middleware.js";
import { connectDB } from "./lib/db.js";

import morgan from "morgan";
import cookieParser from "cookie-parser";
import express from "express";
import categoryRouter from "./routes/category.route.js";
import { createDefaultAdmin } from "./scripts/seed-admin.js";
import addressRouter from "./routes/address.route.js";
import productRouter from "./routes/product.route.js";

const app = express();

app.use(morgan("dev"));
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());

app.use("/api/v1/auth", userRoute);
app.use("/api/v1/category", categoryRouter);
app.use("/api/v1/address", addressRouter);
app.use("/api/v1/product", productRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

app.listen(PORT || 3000, async () => {
  console.log(`Server running in port ${PORT}`);
  await connectDB();
  await createDefaultAdmin();
});

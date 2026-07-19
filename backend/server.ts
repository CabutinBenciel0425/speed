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

const app = express();

app.use(morgan("dev"));
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());

app.use("/api/v1/auth", userRoute);
app.use("/api/v1/category", categoryRouter);
// app.use("/api/v1/addresses", addressesRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

app.listen(PORT || 3000, async () => {
  console.log(`Server running in port ${PORT}`);
  await connectDB();
  await createDefaultAdmin();
});

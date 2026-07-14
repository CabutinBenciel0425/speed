import { PORT } from "./config/envVars.js";
import { userRoute } from "./routes/user.route.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { notFoundMiddleware } from "./middlewares/notFound.middleware.js";
import { connectDB } from "./lib/db.js";

import cookieParser from "cookie-parser";
import express from "express";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/auth", userRoute);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

app.listen(PORT || 3000, () => {
  console.log(`Server running in port ${PORT}`);
  connectDB();
});

import http from "http";
import { app } from "./app.js";
import { io } from "./socket/io.js";
import { socketAuth } from "./middlewares/socketAuth.middleware.js";
import { registerSocketHandlers } from "./socket/socket.js";
import { connectDB } from "./lib/db.js";
import { createDefaultAdmin } from "./scripts/seed-admin.js";
import { startScheduler } from "./jobs/scheduler.js";
import { PORT } from "./config/envVars.js";

const server = http.createServer(app);

io.attach(server);
io.use(socketAuth);
registerSocketHandlers(io);

const startServer = async () => {
  await connectDB();
  await createDefaultAdmin();
  startScheduler();

  const port = Number(PORT) || 10000;
  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
  });
};

startServer();

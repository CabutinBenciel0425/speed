import { Server } from "socket.io";
import { CLIENT_URL } from "../config/envVars.js";

export const io = new Server({
  cors: {
    origin: CLIENT_URL || "http://localhost:5173",
    credentials: true,
  },
});

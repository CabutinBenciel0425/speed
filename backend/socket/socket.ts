import type { Server } from "socket.io";
import { joinDriverRoom, registerDriverEvents } from "./driver.socket.js";
import { joinMerchantRoom, registerMerchantEvents } from "./merchant.socket.js";
import { joinCustomerRoom } from "./customer.socket.js";
import { joinAdminRoom } from "./admin.socket.js";
import type { AuthenticatedSocket } from "../types/types.js";

export function registerSocketHandlers(io: Server) {
  io.on("connection", async (socket: AuthenticatedSocket) => {
    try {
      switch (socket.activeRole) {
        case "Driver": {
          const driverId = await joinDriverRoom(socket);
          if (!driverId) return socket.disconnect(true);
          registerDriverEvents(socket, driverId);
          break;
        }
        case "Merchant": {
          const merchantId = await joinMerchantRoom(socket);
          if (!merchantId) return socket.disconnect(true);
          registerMerchantEvents(socket, merchantId);
          break;
        }
        case "Customer":
          await joinCustomerRoom(socket);
          break;
        case "Admin":
          await joinAdminRoom(socket);
          break;
        default:
          socket.disconnect(true);
      }
    } catch {
      socket.emit("socket:error", { message: "Could not initialize session" });
      socket.disconnect(true);
    }
  });
}

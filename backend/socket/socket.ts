import type { Socket } from "socket.io";
import { io } from "../server.js";
import { joinDriverRoom, registerDriverEvents } from "./driver.socket.js";
import { joinMerchantRoom, registerMerchantEvents } from "./merchant.socket.js";
import { joinCustomerRoom } from "./customer.socket.js";
import { joinAdminRoom } from "./admin.socket.js";
import type { AuthenticatedSocket } from "../types/types.js";

io.on("connection", async (socket: AuthenticatedSocket) => {
  switch (socket.activeRole) {
    case "Driver":
      await joinDriverRoom(socket);
      registerDriverEvents(socket);
      break;

    case "Merchant":
      await joinMerchantRoom(socket);
      registerMerchantEvents(socket);
      break;

    case "Customer":
      await joinCustomerRoom(socket);
      break;

    case "Admin":
      await joinAdminRoom(socket);
      break;
  }
});

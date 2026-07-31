import type { Socket } from "socket.io";
import { io } from "../server.js";
import { joinDriverRoom, registerDriverEvents } from "./driver.socket.js";
import { joinMerchantRoom, registerMerchantEvents } from "./merchant.socket.js";
import { joinCustomerRoom } from "./customer.socket.js";
import { joinAdminRoom } from "./admin.socket.js";

io.on("connection", async (socket: Socket) => {
  if (socket.user.role.includes("Driver")) {
    await joinDriverRoom(socket);
    registerDriverEvents(socket);
  }

  if (socket.user.role.includes("Merchant")) {
    await joinMerchantRoom(socket);
    registerMerchantEvents(socket);
  }

  if (socket.user.role.includes("Customer")) {
    await joinCustomerRoom(socket);
  }

  if (socket.user.role.includes("Admin")) {
    await joinAdminRoom(socket);
  }
});

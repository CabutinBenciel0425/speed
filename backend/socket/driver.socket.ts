import type { Socket } from "socket.io";
import Driver from "../models/driver.model.js";
import {
  driverAcceptOffer,
  driverDeclinedOffer,
} from "../services/driver.service.js";

export async function joinDriverRoom(socket: Socket) {
  const driver = await Driver.findOne({
    user: socket.user._id,
  });

  if (!driver) return null;

  socket.join(`driver:${driver._id}`);
  return driver._id.toString();
}

export function registerDriverEvents(socket: Socket, driverId: string) {
  socket.on("delivery:accept", async ({ offerId }) => {
    try {
      await driverAcceptOffer(offerId, driverId);
      socket.emit("delivery:accepted", { offerId });
    } catch {
      socket.emit("socket:error", { event: "delivery:accept", message: "Could not accept delivery offer" });
    }
  });

  socket.on("delivery:decline", async ({ offerId }) => {
    try {
      await driverDeclinedOffer(offerId, driverId);
    } catch {
      socket.emit("socket:error", { event: "delivery:decline", message: "Could not decline delivery offer" });
    }
  });
}

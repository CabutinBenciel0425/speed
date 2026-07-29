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

  if (!driver) return;

  socket.join(`driver:${driver._id}`);
}

export function registerDriverEvents(socket: Socket) {
  socket.on("delivery:accept", async ({ offerId }) => {
    await driverAcceptOffer(offerId, socket.user._id.toString());
  });

  socket.on("delivery:decline", async ({ offerId }) => {
    await driverDeclinedOffer(offerId);
  });
}

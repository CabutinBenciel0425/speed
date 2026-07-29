import type { Socket } from "socket.io";
import Merchant from "../models/merchant.model.js";
import {
  merchantReadyOrder,
  merchantRejectOrder,
} from "../services/merchant.service.js";

export async function joinMerchantRoom(socket: Socket) {
  const merchant = await Merchant.findOne({
    user: socket.user._id,
  });

  if (!merchant) return;

  socket.join(`merchant:${merchant._id}`);
}

export function registerMerchantEvents(socket: Socket) {
  socket.on("merchant:reject-order", async ({ orderId }) => {
    await merchantRejectOrder(orderId, socket.user._id.toString());
  });
  socket.on("merchant:ready-order", async ({ orderId }) => {
    await merchantReadyOrder(orderId, socket.user._id.toString());
  });
}

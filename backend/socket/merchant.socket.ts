import type { Socket } from "socket.io";
import Merchant from "../models/merchant.model.js";
import {
  merchantReadyOrder,
  merchantRejectOrder,
} from "../services/merchant.service.js";

export async function joinMerchantRoom(socket: Socket) {
  const merchant = await Merchant.findOne({
    owner: socket.user._id,
  });

  if (!merchant) return null;

  socket.join(`merchant:${merchant._id}`);
  return merchant._id.toString();
}

export function registerMerchantEvents(socket: Socket, merchantId: string) {
  socket.on("merchant:reject-order", async ({ orderId }) => {
    try {
      await merchantRejectOrder(orderId, merchantId);
    } catch {
      socket.emit("socket:error", { event: "merchant:reject-order", message: "Could not reject order" });
    }
  });
  socket.on("merchant:ready-order", async ({ orderId }) => {
    try {
      await merchantReadyOrder(orderId, merchantId);
    } catch {
      socket.emit("socket:error", { event: "merchant:ready-order", message: "Could not mark order ready" });
    }
  });
}

import type { Socket } from "socket.io";
import Merchant from "../models/merchant.model.js";

export async function joinMerchantRoom(socket: Socket) {
  const merchant = await Merchant.findOne({
    user: socket.user._id,
  });

  if (!merchant) return;

  socket.join(`merchant:${merchant._id}`);
}

import type { Socket } from "socket.io";
import User from "../models/user.model.js";

export async function joinACustomerRoom(socket: Socket) {
  const customer = await User.findOne({
    _id: socket.user._id,
  });

  if (!customer) return;

  socket.join(`customer:${customer._id}`);
}

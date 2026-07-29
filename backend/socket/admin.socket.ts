import type { Socket } from "socket.io";
import Driver from "../models/driver.model.js";
import User from "../models/user.model.js";

export async function joinAdminRoom(socket: Socket) {
  const admin = await User.findOne({
    _id: socket.user._id,
  });

  if (!admin) return;

  socket.join(`admin:${admin._id}`);
}

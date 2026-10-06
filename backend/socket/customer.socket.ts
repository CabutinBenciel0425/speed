import type { Socket } from "socket.io";

export async function joinCustomerRoom(socket: Socket) {
  socket.join(`customer:${socket.user._id}`);
}

import jwt, { type JwtPayload } from "jsonwebtoken";
import User from "../models/user.model.js";
import { ACCESS_TOKEN_SECRET_KEY } from "../config/envVars.js";
import { Socket } from "socket.io";

export const socketAuth = async (
  socket: Socket,
  next: (err?: Error) => void,
) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) return next(new Error("Unauthorized"));

    const payload = jwt.verify(
      token,
      ACCESS_TOKEN_SECRET_KEY as string,
    ) as JwtPayload;

    const user = await User.findById(payload.userId);

    if (!user) return next(new Error("Unauthorized"));

    socket.user = user;

    next();
  } catch {
    next(new Error("Unauthorized"));
  }
};

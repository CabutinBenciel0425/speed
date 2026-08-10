import jwt, { type JwtPayload } from "jsonwebtoken";
import User from "../models/user.model.js";
import { ACCESS_TOKEN_SECRET_KEY } from "../config/envVars.js";
import type { AuthenticatedSocket } from "../types/types.js";
import type { ValidUserRoleInput } from "../schemas/user.schema.js";

export const socketAuth = async (
  socket: AuthenticatedSocket,
  next: (err?: Error) => void,
) => {
  try {
    const token = socket.handshake.auth.token;

    const activeRole: ValidUserRoleInput = socket.handshake.auth.activeRole;

    if (!token) return next(new Error("Unauthorized"));

    const payload = jwt.verify(
      token,
      ACCESS_TOKEN_SECRET_KEY as string,
    ) as JwtPayload;

    const user = await User.findById(payload.userId);

    if (!user) return next(new Error("Unauthorized"));

    if (!user.role.includes(activeRole)) return next(new Error("Unauthorized"));

    socket.user = user;
    socket.activeRole = activeRole;

    next();
  } catch {
    next(new Error("Unauthorized"));
  }
};

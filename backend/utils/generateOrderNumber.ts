import crypto from "crypto";

export function generateOrderNumber(length: number = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const randomBytes = crypto.randomBytes(length);
  const code = Array.from(
    randomBytes,
    (value) => chars[value % chars.length],
  ).join("");

  return `SPD-${new Date().getFullYear()}-${code}`;
}

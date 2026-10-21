import type { OrderCustomer } from "../types/merchantOrder"

export function formatOrderCustomer(customer: OrderCustomer) {
  if (typeof customer === "string") return "Customer"
  return `${customer.firstName ?? ""} ${customer.lastName ?? ""}`.trim() || "Customer"
}

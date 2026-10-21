import type { DriverOrder } from "../types/driver"

export function formatDriverOrderAddress(order: DriverOrder) {
  const merchant =
    typeof order.merchant === "string" ? "Store" : order.merchant.merchantName
  const area = [order.deliveryAddress?.barangay, order.deliveryAddress?.city]
    .filter(Boolean)
    .join(", ")
  return area ? `${merchant} · ${area}` : merchant
}

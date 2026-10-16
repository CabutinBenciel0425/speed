export type OrderTimelineInput = {
  status: string
  createdAt: string
  preparingAt?: string | null
  readyForPickupAt?: string | null
  merchantConfirmPickedUpAt?: string | null
  driverConfirmPickedUpAt?: string | null
  deliveredAt?: string | null
  rejectedAt?: string | null
  cancelledAt?: string | null
  cancelledBy?: string | null
  cancellationReason?: string | null
  driverArrivedAtMerchantAt?: string | null
}

export type TimelineStepState = "done" | "current" | "upcoming" | "failed"

export type TimelineStep = {
  key: string
  label: string
  description: string
  at: string | null
  state: TimelineStepState
}

const laterOf = (a?: string | null, b?: string | null) => {
  if (!a || !b) return null
  return new Date(a).getTime() >= new Date(b).getTime() ? a : b
}

const getPickupConfirmationNote = (order: OrderTimelineInput) => {
  if (order.merchantConfirmPickedUpAt && !order.driverConfirmPickedUpAt)
    return "Store confirmed the handover. Waiting for the driver to confirm"
  if (order.driverConfirmPickedUpAt && !order.merchantConfirmPickedUpAt)
    return "Driver confirmed the pickup. Waiting for the store to confirm"
  return null
}

export const buildOrderTimeline = (
  order: OrderTimelineInput
): TimelineStep[] => {
  const failed = order.status === "Rejected" || order.status === "Cancelled"
  const pickupNote = getPickupConfirmationNote(order)

  const flow = [
    {
      key: "placed",
      label: "New",
      description: "Customer placed the order",
      at: order.createdAt ?? null,
    },
    {
      key: "preparing",
      label: "Preparing",
      description: "Merchant is preparing the order",
      at: order.preparingAt ?? null,
    },
    {
      key: "ready",
      label: "Ready for Pickup",
      description: pickupNote ?? "Order is ready for the driver",
      at: order.readyForPickupAt ?? null,
    },
    {
      key: "pickedUp",
      label: "Picked Up",
      description: "Driver is on the way to the customer",
      // done only when BOTH sides confirmed
      at: laterOf(
        order.merchantConfirmPickedUpAt,
        order.driverConfirmPickedUpAt
      ),
    },
    {
      key: "delivered",
      label: "Delivered",
      description: "Order was delivered to the customer",
      at: order.deliveredAt ?? null,
    },
  ]

  let lastDoneIndex = -1
  flow.forEach((step, i) => {
    if (step.at) lastDoneIndex = i
  })

  const steps: TimelineStep[] = flow.map((step, i) => {
    let state: TimelineStepState = "upcoming"
    if (step.at) {
      const isCurrent =
        i === lastDoneIndex && !failed && order.status !== "Delivered"
      state = isCurrent ? "current" : "done"
    }
    return { ...step, state }
  })

  if (!failed) return steps

  const reached: TimelineStep[] = steps
    .filter((s) => s.state !== "upcoming")
    .map((s) => ({ ...s, state: "done" as const }))

  const isRejected = order.status === "Rejected"
  const by = order.cancelledBy ?? "Merchant"
  const reason = order.cancellationReason
    ? ` — ${order.cancellationReason}`
    : ""

  reached.push({
    key: "failed",
    label: isRejected ? "Rejected" : "Cancelled",
    description: isRejected
      ? "Order was rejected by the merchant"
      : `Order was cancelled by ${by}${reason}`,
    at: (isRejected ? order.rejectedAt : order.cancelledAt) ?? null,
    state: "failed" as const,
  })

  return reached
}

export const getOrderStatusHeader = (order: OrderTimelineInput) => {
  switch (order.status) {
    case "Pending":
      return { title: "New", subtitle: "Waiting for merchant action" }
    case "Preparing":
      return { title: "Preparing", subtitle: "Prepare the order for pickup" }
    case "ReadyForPickup":
      return {
        title: "Ready for Pickup",
        subtitle:
          getPickupConfirmationNote(order) ??
          (order.driverArrivedAtMerchantAt
            ? "Driver has arrived at your store"
            : "Waiting for the driver to pick up"),
      }
    case "PickedUp":
      return {
        title: "Out for Delivery",
        subtitle: "Driver is delivering to the customer",
      }
    case "Delivered":
      return { title: "Delivered", subtitle: "Order completed" }
    case "Rejected":
      return { title: "Rejected", subtitle: "Rejected by merchant" }
    case "Cancelled":
      return {
        title: "Cancelled",
        subtitle: `Cancelled by ${order.cancelledBy ?? "Merchant"}`,
      }
    default:
      return { title: order.status, subtitle: "" }
  }
}

export const formatStepTime = (iso: string | null) => {
  if (!iso) return ""
  return new Date(iso).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Manila",
  })
}

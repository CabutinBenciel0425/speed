import type { Driver } from "./driver"
import type { User } from "./user"

export interface Order {
  createdAt: Date
  customer: User
  merchant: string
  driver: Driver | null
  orderNumber: string
  items: [
    {
      product: string
      productName: string
      image?: string
      quantity: number
      unitPrice: number
      subtotal: number
      notes: string
    },
  ]
  deliveryAddress: {
    address: string
    recipientName: string
    phoneNumber: string
    houseOrUnitNumber: string
    street: string
    barangay: string
    city: string
    province?: string
    region: string
    location: {
      type: string
      coordinates: number[]
    }
  }
  payment: {
    paymentId?: string
    method: "Cash" | "QRPh"
    status: "Pending" | "Paid" | "Cancelled"
    transactionId?: string | null
  }
  pricing: {
    subtotal: number
    serviceFee: number
    discount: number
    deliveryFee: number
    total: number
  }
  status:
    | "Pending"
    | "Preparing"
    | "ReadyForPickup"
    | "PickedUp"
    | "Delivered"
    | "Cancelled"
    | "Rejected"
    | "NoDriverFound"
  driverMatchingStatus: "Searching" | "Assigned" | "NoDriverFound"
  customerNote: string
  estimatedPreparationTime: number
  estimatedDeliveryTime: number
  driverAssignedAt?: Date
  acceptedAt?: Date
  driverHeadingToMerchantAt?: Date
  merchantReceivedAt?: Date
  preparingAt?: Date
  driverArrivedAtMerchantAt?: Date
  readyForPickupAt?: Date
  pickedUpAt?: Date
  deliveredAt?: Date
  rejectedAt?: Date
  cancelledAt?: Date
  cancelledBy: "Customer" | "Merchant" | "Admin"
  cancellationReason: string
}

export type MerchantOrderStatus =
  | "Pending"
  | "Preparing"
  | "ReadyForPickup"
  | "PickedUp"
  | "Delivered"
  | "Cancelled"
  | "Rejected"
  | "NoDriverFound"

export type OrderCustomer =
  | {
      firstName?: string
      lastName?: string
      phoneNumber?: string
    }
  | string

export type MerchantOrder = {
  _id: string
  orderNumber: string
  customer: OrderCustomer
  items: Array<{
    productName: string
    quantity: number
    unitPrice: number
    subtotal: number
    notes?: string
  }>
  deliveryAddress: {
    street: string
    barangay: string
    city: string
    province: string
  }
  pricing: { subtotal: number; total: number }
  payment: { method: string; status: string; transactionId?: string | null }
  status: MerchantOrderStatus
  driver: { _id: string; workingStatus: string } | string | null
  acceptedAt?: string | null
  driverAssignedAt?: string | null
  merchantReceivedAt?: string | null
  createdAt?: string
}

export type CustomerOrderStatus =
  | "Pending"
  | "Preparing"
  | "ReadyForPickup"
  | "PickedUp"
  | "Delivered"
  | "Cancelled"
  | "Rejected"
  | "NoDriverFound"

export type CustomerOrder = {
  _id: string
  orderNumber: string
  merchant:
    | {
        _id: string
        merchantName?: string
        logo: string
        isOpen: boolean
      }
    | string
  items: Array<{
    productName: string
    quantity: number
    unitPrice: number
    subtotal: number
    notes?: string
  }>
  deliveryAddress: {
    houseOrUnitNumber: string
    street: string
    barangay: string
    city: string
    province: string
  }
  pricing: { total: number }
  payment: { method: string; status: string; transactionId?: string | null }
  status: CustomerOrderStatus
  driver: { _id: string; workingStatus: string } | string | null
  acceptedAt?: string | null
  driverAssignedAt?: string | null
  merchantReceivedAt?: string | null
  createdAt?: string
}

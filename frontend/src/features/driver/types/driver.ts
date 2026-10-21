import type { User } from "@/types/user"

export type DriverAvailability =
  | "Offline"
  | "Available"
  | "Assigned"
  | "HeadingToMerchant"
  | "ArrivedAtMerchant"
  | "Delivering"
export type DriverStatus = "Pending" | "Operational" | "Suspended"

export interface DriverProfile {
  _id: string
  user: User
  avatar?: string
  vehicleType: "Motorcycle" | "Bicycle"
  plateNumber?: string
  status: DriverStatus
  isAvailable: boolean
  workingStatus: DriverAvailability
  activeOrder?: string | null
  completedDeliveries: number
  cancelledDeliveries: number
  totalEarnings: number
  ratingCount: number
  averageRating: number
}

export interface DriverOrder {
  _id: string
  orderNumber: string
  status: string
  createdAt?: string
  merchant: { merchantName: string; address?: DriverAddress } | string
  customer?: { firstName?: string; lastName?: string; phoneNumber?: string }
  deliveryAddress?: DriverAddress
  pricing?: { deliveryFee?: number; total?: number }
  items?: Array<{ productName: string; quantity: number; unitPrice?: number }>
  driverArrivedAtMerchantAt?: string
  driverConfirmPickedUpAt?: string
  merchantConfirmPickedUpAt?: string
}

export interface DriverAddress {
  street?: string
  barangay?: string
  city?: string
  province?: string
}

export interface DeliveryOffer {
  offerId: string
  merchantName: string
  merchantAddress?: DriverAddress
  customerAddress?: DriverAddress
  deliveryFee: number
  estimatedDistance: number
  estimatedDuration: number
}

export interface DriverReview {
  _id: string
  rating: number
  comment: string
  createdAt: string
  reviewer?: { firstName?: string; lastName?: string; avatar?: string }
  order?: { orderNumber?: string } | string
}

export type DriverOrderAction =
  "heading-to-merchant" | "picked-up" | "delivered"

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
  merchant:
    | { merchantName: string; phoneNumber?: string; address?: DriverAddress & { location?: { coordinates?: number[] } } }
    | string
  customer?: { firstName?: string; lastName?: string; phoneNumber?: string }
  deliveryAddress?: DriverAddress & {
    recipientName?: string
    phoneNumber?: string
    houseOrUnitNumber?: string
    region?: string
    address?: string | { instructions?: string; landmark?: string }
  }
  payment?: { method: "Cash" | "QRPh"; status: "Pending" | "Paid" | "Cancelled" }
  pricing?: { subtotal?: number; serviceFee?: number; discount?: number; deliveryFee?: number; total?: number }
  estimatedDeliveryTime?: number
  deliveryDistanceKm?: number | null
  items?: Array<{ productName: string; image?: string; quantity: number; unitPrice?: number; subtotal?: number; notes?: string }>
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

export interface PaginatedDriverReviews {
  success: boolean
  data: DriverReview[]
  pagination: { total: number; page: number; limit: number; pages: number }
}

export type DriverOrderAction =
  "heading-to-merchant" | "picked-up" | "delivered"

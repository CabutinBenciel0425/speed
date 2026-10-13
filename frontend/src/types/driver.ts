import type { User } from "./user"

export interface Driver {
  user: User
  avatar?: string
  vehicleType: "Motorcycle" | "Bicycle"
  plateNumber: string
  status: "Pending" | "Operational" | "Suspended"
  isAvailable: boolean
  workingStatus:
    | "Offline"
    | "Available"
    | "Assigned"
    | "HeadingToMerchant"
    | "ArrivedAtMerchant"
    | "Delivering"
  activeOrder: string
  currentLocation: {
    types: string
    coordinates: number[]
  }
  completedDeliveries: number
  cancelledDeliveries: number
  totalEarnings: number
  ratingCount: number
  averageRating: number
}

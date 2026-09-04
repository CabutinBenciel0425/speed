import type { Pagination } from "./products"

export interface Merchant extends Document {
  _id: string
  owner: string
  merchantName: string
  description?: string
  phoneNumber: string
  isOpen: boolean
  logo: string
  banner: string
  address: {
    location: {
      type: string
      coordinates: number[]
    }
    street: string
    barangay: string
    city: string
    province: string
  }
  operatingHours: {
    Monday: {
      isOpen: boolean
      openHour: number
      openMinute: number
      closeHour: number
      closeMinute: number
    }
    Tuesday: {
      isOpen: boolean
      openHour: number
      openMinute: number
      closeHour: number
      closeMinute: number
    }
    Wednesday: {
      isOpen: boolean
      openHour: number
      openMinute: number
      closeHour: number
      closeMinute: number
    }
    Thursday: {
      isOpen: boolean
      openHour: number
      openMinute: number
      closeHour: number
      closeMinute: number
    }
    Friday: {
      isOpen: boolean
      openHour: number
      openMinute: number
      closeHour: number
      closeMinute: number
    }
    Saturday: {
      isOpen: boolean
      openHour: number
      openMinute: number
      closeHour: number
      closeMinute: number
    }
    Sunday: {
      isOpen: boolean
      openHour: number
      openMinute: number
      closeHour: number
      closeMinute: number
    }
  }
  minimumOrder: number
  status: "Pending" | "Approved" | "Rejected" | "Open" | "Closed" | "Suspended"
  completedOrders: number
  totalRevenue: number
  ratingCount: number
  averageRating: number
}

export type SelectedMerchant = {
  _id: string
  description: string
  merchantName: string
  logo: string
  averageRating: number
  ratingCount: number
}

export type FetchMerchantResponse = {
  success: boolean
  data: Merchant[]
  pagination: Pagination
}

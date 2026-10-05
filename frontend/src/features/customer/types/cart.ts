import type { Merchant } from "./merchant"
import type { Product } from "./products"

export type Cart = {
  _id: string
  customer: string
  merchant: Merchant
  items: {
    id: string
    product: Product
    quantity: number
    note?: string
  }[]
  deliveryAddress: {
    address: string
    street: string
    barangay: string
    city: string
    province: string
    location: {
      type: string
      coordinates: number[]
    }
  }
  payment: {
    method: "Cash" | "QRPh"
  }
  pricing: {
    subtotal: number
    serviceFee: number
    discount: number
    deliveryFee: number
    total: number
  }
  customerNote?: string
  estimatedPreparationTime: number
  estimatedDeliveryTime: number
}

export type CartItemWithId = {
  id: string
  product: Product
  quantity: number
  note?: string
}

export type CartItemWithoutId = {
  product: string
  quantity: number
  note?: string
}

export type CartResult = {
  success: boolean
  message: string
  data?: Cart | null
}

export type CartResultNoData = {
  success: boolean
  message: string
}

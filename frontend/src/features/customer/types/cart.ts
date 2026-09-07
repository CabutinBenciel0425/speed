export type Cart = {
  id: string
  customer: string
  merchant: string
  items: CartItem[]
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

export type CartItem = {
  product: string
  quantity: number
  notes?: string
}

export type CartResult = {
  success: true
  message: string
  data: Cart
}

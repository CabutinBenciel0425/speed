export interface Review {
  order: string
  reviewer: string
  reviewee: string
  targetType: "Merchant" | "Driver"
  rating: number
  comment: string
  isHidden: boolean
}

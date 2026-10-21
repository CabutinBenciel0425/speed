export interface Review {
  _id: string
  order: { _id?: string; orderNumber?: string; createdAt?: string } | string
  reviewer:
    | { _id?: string; firstName?: string; lastName?: string; avatar?: string }
    | string
  reviewee:
    | {
        _id?: string
        merchantName?: string
        firstName?: string
        lastName?: string
        logo?: string
      }
    | string
  targetType: "Merchant" | "Driver"
  rating: number
  comment: string
  isHidden: boolean
  createdAt: string
  updatedAt?: string
}

import type { Category } from "./category"
import type { Merchant } from "./merchant"

export interface Product {
  _id: string
  merchant: string
  category: string
  name: string
  slug: string
  description: string
  price: number
  image?: string
  preparationTime: number
  ingredients: string[]
  tags: string[]
  isAvailable: boolean
  isFeatured: boolean
  totalSold: number
}

export type Pagination = {
  total: number
  page: number
  limit: number
  pages: number
}

export type ProductWithCategory = {
  category: Category
  products: Product[]
}

export type ProductWithMerchant = {
  merchant: Merchant
  products: Product[]
}

export type CategoryByProducts = {
  success: boolean
  data: ProductWithCategory | null
  pagination: Pagination | null
}

export type MerchantByProducts = {
  success: boolean
  data: ProductWithMerchant | null
  pagination: Pagination | null
}

export type TopProductTag = {
  _id: string
  count: number
}

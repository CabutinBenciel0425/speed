import type { Category } from "./category"

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

export type ProductWithCategoryName = {
  category: Category
  products: Product[]
}

export type CategoryByProducts = {
  success: boolean
  data: ProductWithCategoryName | null
  pagination: Pagination | null
}

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

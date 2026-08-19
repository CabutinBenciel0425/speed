export interface Category extends Document {
  _id: string
  name: string
  slug: string
  description?: string
  image: string
  isActive: boolean
  displayOrder: number
  createdAt?: string
  updatedAt?: string
}

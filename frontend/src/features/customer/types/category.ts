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

export type CategoryList =
  | "Chicken"
  | "Burgers"
  | "Rice Meals"
  | "Pizzas"
  | "Pastas"
  | "Drinks"
  | "Desserts"
  | "Soups"
  | "Others / Sides & Snacks"

import type { Merchant } from "./merchant"
import type { Product } from "./products"

export type ProductFavorite = {
  _id: string
  user: string
  product: Product
}

export type MerchantFavorite = {
  _id: string
  user: string
  merchant: Merchant
}

export type FavoriteLists = {
  products: ProductFavorite
  merchants: MerchantFavorite
}

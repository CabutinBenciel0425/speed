import type { Merchant } from "./merchant"
import type { Pagination, Product } from "./products"

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

export type MerchantFavoritePagination = {
  merchants: MerchantFavorite[]
  pagination: Pagination
}

export type ProductFavoritePagination = {
  products: ProductFavorite[]
  pagination: Pagination
}

export type FavoriteLists = {
  products: ProductFavoritePagination
  merchants: MerchantFavoritePagination
}

export type FavoriteListsPageProps = {
  products?: ProductFavoritePagination
  merchants?: MerchantFavoritePagination
  isLoading: boolean
  error: boolean
}

import type {
  Merchant,
  SelectedMerchant,
} from "@/features/customer/types/merchant"
import type {
  Product,
  SelectedProductWithMerchant,
} from "@/features/customer/types/products"

export type SearchDropdownResults = {
  merchants: SelectedMerchant[]
  products: SelectedProductWithMerchant[]
}

export type SearchProductsResults = {
  products: Product[]
  pagination: Pagination
}

export type SearchMerchantsResults = {
  merchants: Merchant[]
  pagination: Pagination
}

export type SearchPageResultsType = {
  products: SearchProductsResults
  merchants: SearchMerchantsResults
}

export type SearchPageResultsProps = {
  products?: SearchProductsResults
  merchants?: SearchMerchantsResults
  isLoading: boolean
  isError: boolean
  query: string
}

export type Pagination = {
  total: number
  page: number
  limit: number
  pages: number
}

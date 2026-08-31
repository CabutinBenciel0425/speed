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

export type SearchPageResults = {
  merchants: Merchant[]
  products: Product[]
  isLoading: boolean
  isError: boolean
}

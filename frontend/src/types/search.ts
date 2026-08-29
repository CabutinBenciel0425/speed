import type { SelectedMerchant } from "@/features/customer/types/merchant"
import type { SelectedProductWithMerchant } from "@/features/customer/types/products"

export type SearchResults = {
  merchants: SelectedMerchant[]
  products: SelectedProductWithMerchant[]
}

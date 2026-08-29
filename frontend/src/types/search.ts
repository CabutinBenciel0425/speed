import type { Merchant } from "@/features/customer/types/merchant"
import type { Product } from "@/features/customer/types/products"

export type SearchResults = {
  merchants: Merchant[]
  products: Product[]
}

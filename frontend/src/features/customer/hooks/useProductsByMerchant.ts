import axios from "@/lib/axios"
import type { MerchantByProducts } from "../types/products"
import { useQuery } from "@tanstack/react-query"

export type RequestType = "public" | "merchant"

const fetchProductsByMerchant = async (
  merchantId: string,
  page: number,
  tags: string = "",
  sort: string = "-price",
  limit: number,
  requestType: RequestType,
  category: string = "",
): Promise<MerchantByProducts> => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (tags) params.set("tags", tags)
  if (sort) params.set("sort", sort)
  if (category) params.set("category", category)
  const urlToUse = `/merchant/${merchantId}/${requestType}/products?${params.toString()}`

  const { data } = await axios.get<MerchantByProducts>(urlToUse)

  return data
}

export const useProductsByMerchant = (
  merchantId: string,
  page: number = 1,
  tags: string = "",
  sort: string = "",
  limit: number = 100,
  requestType: RequestType,
  category: string = "",
) => {
  const {
    data: productsByMerchant,
    isLoading: isLoadingProducts,
    error: errorProducts,
  } = useQuery<MerchantByProducts>({
    queryKey: ["products", merchantId, page, tags, limit, sort, requestType, category],
    queryFn: () =>
      fetchProductsByMerchant(merchantId, page, tags, sort, limit, requestType, category),
    enabled: !!merchantId,
    staleTime: 1000 * 60 * 1,
  })

  return {
    productsByMerchant,
    isLoadingProducts,
    errorProducts,
  }
}

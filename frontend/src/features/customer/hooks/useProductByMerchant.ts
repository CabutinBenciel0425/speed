import axios from "@/lib/axios"
import type { MerchantByProducts } from "../types/products"
import { useQuery } from "@tanstack/react-query"

const fetchProductsByMerchant = async (
  merchantId: string,
  page: number,
  tags: string = "",
  sort: string = "-price",
  limit: number
): Promise<MerchantByProducts> => {
  const urlToUse =
    tags !== null && tags !== ""
      ? `/merchant/${merchantId}/products?tags=${tags}&sort=${sort}&page=${page}&limit=${limit}`
      : sort !== null && sort !== ""
        ? `/merchant/${merchantId}/products?sort=${sort}&page=${page}&limit=${limit}`
        : `/merchant/${merchantId}/products?page=${page}&limit=${limit}`

  const { data } = await axios.get<MerchantByProducts>(urlToUse)

  return data
}

export const useProductsByMerchant = (
  merchantId: string,
  page: number = 1,
  tags: string = "",
  sort: string = "",
  limit: number = 100
) => {
  const {
    data: productsByMerchant,
    isLoading: isLoadingProducts,
    error: errorProducts,
  } = useQuery<MerchantByProducts>({
    queryKey: ["products", merchantId, page, tags, limit, sort],
    queryFn: () => fetchProductsByMerchant(merchantId, page, tags, sort, limit),
    enabled: !!merchantId,
    staleTime: 1000 * 60 * 1,
  })

  return {
    productsByMerchant,
    isLoadingProducts,
    errorProducts,
  }
}

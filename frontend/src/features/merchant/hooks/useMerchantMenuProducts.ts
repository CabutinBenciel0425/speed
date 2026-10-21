import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "@/lib/axios"
import type { Product } from "@/features/customer/types/products"
import { toast } from "sonner"
import { apiErrorMessage } from "../utils/apiErrorMessage"

type ProductListResponse = {
  data: { products: Product[] }
  pagination: { pages: number; total: number }
}

async function fetchMerchantProducts(
  merchantId: string,
  categoryId: string
): Promise<Product[]> {
  const params = new URLSearchParams({
    page: "1",
    limit: "50",
    sort: "-createdAt",
  })
  if (categoryId) params.set("category", categoryId)

  const firstPage = await axios.get<ProductListResponse>(
    `/merchant/${merchantId}/merchant/products?${params.toString()}`
  )
  const products = firstPage.data.data.products

  for (let page = 2; page <= firstPage.data.pagination.pages; page += 1) {
    params.set("page", String(page))
    const { data } = await axios.get<ProductListResponse>(
      `/merchant/${merchantId}/merchant/products?${params.toString()}`
    )
    products.push(...data.data.products)
  }

  return products
}

export function useMerchantMenuProducts(
  merchantId: string | undefined,
  categoryId: string
) {
  return useQuery({
    queryKey: ["merchantMenuProducts", merchantId, categoryId],
    queryFn: () => fetchMerchantProducts(merchantId!, categoryId),
    enabled: Boolean(merchantId),
    staleTime: 30_000,
  })
}

export function useMerchantProductActions(merchantId: string | undefined) {
  const queryClient = useQueryClient()
  const invalidateProducts = () =>
    queryClient.invalidateQueries({
      queryKey: ["merchantMenuProducts", merchantId],
    })

  const toggleAvailability = useMutation({
    mutationFn: (productId: string) => {
      if (!merchantId) throw new Error("Merchant profile is unavailable")
      return axios.patch(
        `/product/${merchantId}/${productId}/availability/status`
      )
    },
    onSuccess: () => {
      toast.success("Product availability updated")
      void invalidateProducts()
    },
    onError: (error) =>
      toast.error(
        apiErrorMessage(error, "Could not update product availability.")
      ),
  })

  const deleteProduct = useMutation({
    mutationFn: (productId: string) => {
      if (!merchantId) throw new Error("Merchant profile is unavailable")
      return axios.delete(`/product/${merchantId}/${productId}`)
    },
    onSuccess: () => {
      toast.success("Product deleted")
      void invalidateProducts()
    },
    onError: (error) =>
      toast.error(apiErrorMessage(error, "Could not delete this product.")),
  })

  return { toggleAvailability, deleteProduct }
}

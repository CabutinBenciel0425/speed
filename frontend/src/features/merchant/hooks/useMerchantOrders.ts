import { useQuery } from "@tanstack/react-query"
import axios from "@/lib/axios"
import type { PaginatedResponse } from "@/types/pagination"
import type { Merchant } from "@/features/customer/types/merchant"
import type { MerchantOrder } from "../types/merchantOrder"

export function useMerchantOrders(userId: string | undefined, page: number) {
  const merchantQuery = useQuery({
    queryKey: ["merchantProfile", userId],
    queryFn: async () =>
      (
        await axios.get<{ data: Pick<Merchant, "_id" | "merchantName"> }>(
          "/merchant/me"
        )
      ).data.data,
    enabled: Boolean(userId),
    staleTime: 60_000,
  })
  const merchantId = merchantQuery.data?._id
  const ordersQuery = useQuery({
    queryKey: ["merchantOrders", merchantId, page],
    queryFn: async () =>
      (
        await axios.get<PaginatedResponse<MerchantOrder>>(
          `/merchant/${merchantId}/orders`,
          { params: { page, limit: 8 } }
        )
      ).data,
    enabled: Boolean(merchantId),
    staleTime: 15_000,
    refetchInterval: 30_000,
  })

  return { merchantQuery, merchantId, ordersQuery }
}

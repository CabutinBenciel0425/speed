import { useQuery } from "@tanstack/react-query"
import axios from "@/lib/axios"
import type { PaginatedResponse } from "@/types/pagination"
import type { CustomerOrder } from "../types/customerOrder"

export function useCustomerOrders(userId: string | undefined, page: number) {
  return useQuery({
    queryKey: ["customerOrders", userId, page],
    queryFn: async () =>
      (
        await axios.get<PaginatedResponse<CustomerOrder>>("/orders", {
          params: { page, limit: 8 },
        })
      ).data,
    enabled: Boolean(userId),
    staleTime: 15_000,
    refetchInterval: 30_000,
  })
}

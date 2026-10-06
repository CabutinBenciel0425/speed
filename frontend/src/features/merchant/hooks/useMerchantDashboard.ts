import { useQuery } from "@tanstack/react-query"
import axios from "@/lib/axios"

export type MerchantDashboardData = {
  merchant: {
    _id: string
    merchantName: string
    isOpen: boolean
  }
  todayRevenue: number
  todayOrders: number
  activeOrders: number
  pendingOrders: number
  recentOrders: Array<{
    _id: string
    orderNumber: string
    status: string
    createdAt?: string
    pricing?: { total?: number }
    items: Array<{ productName: string; quantity: number }>
  }>
}

export function useMerchantDashboard() {
  return useQuery({
    queryKey: ["merchantDashboard"],
    queryFn: async () => {
      const { data } = await axios.get<{ data: MerchantDashboardData }>(
        "/merchant/dashboard"
      )
      return data.data
    },
    staleTime: 20_000,
    refetchInterval: 30_000,
  })
}

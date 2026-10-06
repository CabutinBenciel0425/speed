import { useQuery } from "@tanstack/react-query"
import axios from "@/lib/axios"

export type AnalyticsPeriod = "7d" | "30d" | "90d"

export type MerchantAnalytics = {
  period: AnalyticsPeriod
  revenue: number
  averageOrderValue: number
  total: number
  active: number
  completed: number
  cancelled: number
  trend: Array<{ _id: string; revenue: number; orders: number }>
  topProducts: Array<{
    _id: string
    name: string
    quantity: number
    revenue: number
  }>
}

export function useMerchantAnalytics(period: AnalyticsPeriod) {
  return useQuery({
    queryKey: ["merchantAnalytics", period],
    queryFn: async () => {
      const { data } = await axios.get<{ data: MerchantAnalytics }>(
        "/merchant/analytics",
        { params: { period } }
      )
      return data.data
    },
  })
}

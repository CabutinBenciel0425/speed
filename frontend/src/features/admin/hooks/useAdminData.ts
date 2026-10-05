import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import { toast } from "sonner"
import axios from "@/lib/axios"
import type {
  AdminListResponse,
  AdminRecord,
  AdminSection,
  AdminSummary,
} from "../types/admin"

const paths: Record<AdminSection, string> = {
  users: "/admin/users",
  merchants: "/admin/merchant",
  drivers: "/admin/driver",
  orders: "/admin/order",
  products: "/admin/product",
  reviews: "/admin/review",
  categories: "/category",
}

const message = (error: unknown, fallback: string) =>
  isAxiosError<{ message?: string }>(error)
    ? (error.response?.data?.message ?? fallback)
    : fallback

export function useAdminResource(
  section: AdminSection,
  search: string,
  page: number
) {
  return useQuery({
    queryKey: ["admin", section, search, page],
    enabled: Boolean(paths[section]),
    queryFn: async () => {
      const { data } = await axios.get<AdminListResponse>(paths[section], {
        params: {
          page,
          limit: 20,
          sort: "-createdAt",
          search: search || undefined,
        },
      })
      return data
    },
  })
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: async () => {
      const { data } = await axios.get<{ data: AdminSummary }>(
        "/admin/dashboard"
      )
      return data.data
    },
  })
}

export function useAdminRevenue(period: "hour" | "day" | "week" | "month") {
  return useQuery({
    queryKey: ["admin", "revenue", period],
    queryFn: async () => {
      const { data } = await axios.get<{
        data: { _id: string | number; revenue: number; orders: number }[]
      }>(`/admin/analytics/revenue/${period}`)
      return data.data
    },
  })
}

const detailPaths: Partial<Record<AdminSection, (id: string) => string>> = {
  users: (id) => `/admin/users/${id}`,
  merchants: (id) => `/admin/merchant/${id}`,
  drivers: (id) => `/admin/driver/${id}`,
  orders: (id) => `/admin/order/${id}`,
  reviews: (id) => `/admin/review/${id}`,
}

export function useAdminDetails(section: AdminSection, id: string | null) {
  return useQuery({
    queryKey: ["admin", "detail", section, id],
    enabled: Boolean(id && detailPaths[section]),
    queryFn: async () => {
      const path = detailPaths[section]
      if (!path || !id) return null
      const { data } = await axios.get<{ data: AdminRecord }>(path(id))
      return data.data
    },
  })
}

export function useAdminOrderAnalytics() {
  return useQuery({
    queryKey: ["admin", "orderAnalytics"],
    queryFn: async () => {
      const { data } = await axios.get<{
        data: {
          activeOrders: number
          completedOrders: number
          cancelledOrders: number
        }
      }>("/admin/analytics/orders")
      return data.data
    },
  })
}

type AdminAction = { section: AdminSection; id: string; value?: string }

export function useAdminActions() {
  const client = useQueryClient()
  const refresh = () => client.invalidateQueries({ queryKey: ["admin"] })
  const mutation = useMutation({
    mutationFn: async ({ section, id, value }: AdminAction) => {
      if (section === "users") return axios.delete(`/admin/users/${id}`)
      if (section === "merchants")
        return axios.patch(`/admin/merchant/${id}/${value}`)
      if (section === "drivers")
        return axios.patch(`/admin/driver/${id}/${value}`)
      if (section === "orders") return axios.patch(`/admin/order/${id}/cancel`)
      if (section === "products")
        return value === "delete"
          ? axios.delete(`/admin/product/${id}`)
          : axios.patch(`/admin/product/${id}/status`)
      if (section === "reviews")
        return axios.patch(`/admin/review/${id}/delete`)
      if (section === "categories") return axios.patch(`/category/${id}/status`)
      throw new Error("No action is available for this item")
    },
    onSuccess: () => {
      toast.success("Changes saved")
      void refresh()
    },
    onError: (error) => toast.error(message(error, "Could not save changes.")),
  })

  const saveCategory = useMutation({
    mutationFn: async ({ id, payload }: { id?: string; payload: FormData }) =>
      id
        ? axios.patch(`/category/${id}`, payload)
        : axios.post("/category/create", payload),
    onSuccess: () => {
      toast.success("Category saved")
      void refresh()
    },
    onError: (error) => toast.error(message(error, "Could not save category.")),
  })

  return { action: mutation, saveCategory }
}

export type { AdminRecord }

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import { toast } from "sonner"
import axios from "@/lib/axios"
import type { PaginatedResponse } from "@/types/pagination"
import type { PaginatedDriverReviews } from "../types/driver"
import type {
  DriverOrder,
  DriverOrderAction,
  DriverProfile,
} from "../types/driver"

export const driverKeys = {
  profile: ["driverProfile"] as const,
  currentOrder: ["driverCurrentOrder"] as const,
  history: ["driverOrderHistory"] as const,
  reviews: ["driverReviews"] as const,
}

export function useDriverProfile(enabled = true) {
  return useQuery({
    queryKey: driverKeys.profile,
    queryFn: async () =>
      (await axios.get<{ data: DriverProfile }>("/driver")).data.data,
    enabled,
    staleTime: 30_000,
    refetchInterval: enabled ? 30_000 : false,
  })
}

export function useDriverCurrentOrder(enabled = true) {
  return useQuery({
    queryKey: driverKeys.currentOrder,
    queryFn: async () =>
      (await axios.get<{ data?: DriverOrder }>("/driver/orders/current")).data
        .data ?? null,
    enabled,
    staleTime: 10_000,
    refetchInterval: enabled ? 20_000 : false,
  })
}

export function useDriverOrderDetails(orderId: string | undefined) {
  return useQuery({
    queryKey: [...driverKeys.currentOrder, "details", orderId],
    queryFn: async () =>
      (await axios.get<{ data: DriverOrder }>(`/driver/orders/${orderId}`)).data.data,
    enabled: Boolean(orderId),
    staleTime: 15_000,
  })
}

export function useDriverOrderHistory(page: number, enabled = true) {
  return useQuery({
    queryKey: [...driverKeys.history, page],
    queryFn: async () =>
      (
        await axios.get<PaginatedResponse<DriverOrder>>(
          `/driver/orders/history?page=${page}&limit=8`
        )
      ).data,
    enabled,
    staleTime: 60_000,
  })
}

export function useDriverReviews(page: number, enabled = true) {
  return useQuery({
    queryKey: [...driverKeys.reviews, page],
    queryFn: async () =>
      (await axios.post<PaginatedDriverReviews>(`/review/driver?page=${page}&limit=8`)).data,
    enabled,
    staleTime: 60_000,
  })
}

export function useDriverAvailability() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (isAvailable: boolean) =>
      (
        await axios.patch<{ data: DriverProfile }>("/driver/availability", {
          isAvailable,
        })
      ).data.data,
    onSuccess: (profile) => {
      queryClient.setQueryData(driverKeys.profile, profile)
      toast.success(
        profile.isAvailable
          ? "You’re online and can receive offers."
          : "You’re offline."
      )
    },
    onError: (error) =>
      toast.error(apiMessage(error, "Could not update availability.")),
  })
}

export function useDriverOrderAction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      orderId,
      action,
    }: {
      orderId: string
      action: DriverOrderAction
    }) => axios.patch(`/driver/orders/${orderId}/${action}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: driverKeys.currentOrder })
      void queryClient.invalidateQueries({ queryKey: driverKeys.profile })
      void queryClient.invalidateQueries({ queryKey: driverKeys.history })
    },
    onError: (error) =>
      toast.error(
        apiMessage(error, "That delivery update could not be saved.")
      ),
  })
}

export function useUpdateDriverProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: FormData) =>
      (await axios.patch<{ data: DriverProfile }>("/driver", payload)).data
        .data,
    onSuccess: (profile) => {
      queryClient.setQueryData(driverKeys.profile, profile)
      toast.success("Driver profile updated.")
    },
    onError: (error) =>
      toast.error(apiMessage(error, "Could not update your profile.")),
  })
}

function apiMessage(error: unknown, fallback: string) {
  return isAxiosError<{ message?: string }>(error)
    ? (error.response?.data?.message ?? fallback)
    : fallback
}

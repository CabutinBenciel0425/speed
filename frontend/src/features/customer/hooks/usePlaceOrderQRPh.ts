import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import { toast } from "sonner"
import axios from "@/lib/axios"

export type QRPhPaymentResponseType = {
  paymentId: string
  paymentIntentId: string
  qrCodeImage?: string
  amount: number
  expiresAt: string
  status?: QRPhPaymentStatus["status"]
}

export function usePlaceOrderQRPh() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await axios.post<{ data: QRPhPaymentResponseType }>(
        "/payment/checkout/qrph",
        undefined,
        { timeout: 60_000 }
      )
      return data.data
    },
    onSuccess: (payment) => {
      queryClient.setQueryData<QRPhPaymentStatus>(
        ["qrPhPaymentStatus", payment.paymentId],
        (current) => ({
          _id: payment.paymentId,
          status: payment.status ?? "Pending",
          order: current?.order ?? null,
          expiresAt: payment.expiresAt,
        })
      )
      void queryClient.invalidateQueries({ queryKey: ["pendingQRPhPayment"] })
    },
    onError: (error) => {
      void queryClient.invalidateQueries({ queryKey: ["pendingQRPhPayment"] })
      const message = isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : error instanceof Error
          ? error.message
          : undefined
      toast.error(
        message ??
          "We couldn’t confirm QR setup. Retry to resume if the request reached us."
      )
    },
  })
}

export function usePendingQRPhPayment() {
  return useQuery({
    queryKey: ["pendingQRPhPayment"],
    queryFn: async () => {
      const { data } = await axios.get<{
        data: QRPhPaymentResponseType | null
      }>("/payment/checkout/qrph/pending")
      return data.data
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
  })
}

export type QRPhPaymentStatus = {
  _id: string
  status:
    | "Pending"
    | "GeneratingQR"
    | "Processing"
    | "Paid"
    | "Failed"
    | "Expired"
    | "Refunded"
  order: string | null
  expiresAt: string
}

export function useQRPhPaymentStatus(paymentId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["qrPhPaymentStatus", paymentId],
    queryFn: async () => {
      const { data } = await axios.get<{ data: QRPhPaymentStatus }>(
        `/payment/${paymentId}`
      )
      return data.data
    },
    enabled: Boolean(paymentId) && enabled,
    staleTime: 0,
    refetchInterval: (query) =>
      query.state.data?.status === "Pending" ||
      query.state.data?.status === "GeneratingQR" ||
      query.state.data?.status === "Processing"
        ? 5000
        : false,
    refetchIntervalInBackground: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    retry: 5,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 15000),
  })
}

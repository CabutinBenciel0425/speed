import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "@/lib/axios"
import { toast } from "sonner"

export type CustomerNotification = {
  _id: string
  targetId: string
  targetType: "Customer" | "Merchant" | "Driver"
  type:
    | "PAYMENT_SUCCESS"
    | "PAYMENT_FAILED"
    | "PAYMENT_EXPIRED"
    | "ORDER_ACCEPTED"
    | "ORDER_REJECTED"
    | "DRIVER_ASSIGNED"
    | "DRIVER_ARRIVED"
    | "ORDER_DELIVERED"
    | "ORDER_CANCELLED"
    | "NO_DRIVER_FOUND"
    | "NEW_ORDER"
    | "NEW_DELIVERY_OFFER"
    | "DRIVER_PICKED_UP"
  title: string
  message: string
  order: string | null
  isRead: boolean
  createdAt: string
}

type NotificationListResponse = {
  notifications: CustomerNotification[]
  unreadCount: number
}

const queryKey = ["customerNotifications"]

export function useCustomerNotifications() {
  const queryClient = useQueryClient()
  const notifications = useQuery({
    queryKey,
    queryFn: async () => {
      const { data } = await axios.get<{ data: NotificationListResponse }>(
        "/notification/me"
      )
      return data.data
    },
    staleTime: 10_000,
    refetchInterval: 20_000,
  })

  const markRead = useMutation({
    mutationFn: (notificationId: string) =>
      axios.patch(`/notification/me/${notificationId}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    onError: () => toast.error("Could not mark this notification as read."),
  })

  const markAllRead = useMutation({
    mutationFn: () => axios.patch("/notification/me/read-all"),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey })
      toast.success("All notifications marked as read")
    },
    onError: () => toast.error("Could not update notifications."),
  })

  return { ...notifications, markRead, markAllRead }
}

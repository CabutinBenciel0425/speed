import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "@/lib/axios"
import { toast } from "sonner"

export type MerchantNotification = {
  _id: string
  type: string
  title: string
  message: string
  order: string | null
  isRead: boolean
  createdAt: string
}

type NotificationListResponse = {
  notifications: MerchantNotification[]
  unreadCount: number
}

const queryKey = ["merchantNotifications"]

export function useMerchantNotifications() {
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

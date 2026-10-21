import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import axios from "@/lib/axios"
import type { AdminNotificationList } from "../types/notification"

const queryKey = ["adminNotifications"]

export function useAdminNotifications() {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const { data } = await axios.get<{ data: AdminNotificationList }>(
        "/notification/me"
      )
      return data.data
    },
    staleTime: 10_000,
    refetchInterval: 20_000,
  })
  const refresh = () => queryClient.invalidateQueries({ queryKey })

  const markRead = useMutation({
    mutationFn: (id: string) => axios.patch(`/notification/me/${id}/read`),
    onSuccess: refresh,
    onError: () => toast.error("Could not mark notification as read."),
  })
  const markAllRead = useMutation({
    mutationFn: () => axios.patch("/notification/me/read-all"),
    onSuccess: () => {
      void refresh()
      toast.success("All notifications marked as read")
    },
    onError: () => toast.error("Could not update notifications."),
  })
  const remove = useMutation({
    mutationFn: (id: string) => axios.delete(`/notification/me/${id}`),
    onSuccess: refresh,
    onError: () => toast.error("Could not delete notification."),
  })
  const clear = useMutation({
    mutationFn: () => axios.delete("/notification/me"),
    onSuccess: () => {
      void refresh()
      toast.success("Notifications cleared")
    },
    onError: () => toast.error("Could not clear notifications."),
  })

  return { ...query, markRead, markAllRead, remove, clear }
}

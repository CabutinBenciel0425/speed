import { useEffect } from "react"
import { io } from "socket.io-client"
import { useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "@/store/authStore"

const socketUrl = import.meta.env.DEV ? "http://localhost:5050" : undefined

export function useAdminRealtime() {
  const queryClient = useQueryClient()
  const activeRole = useAuthStore((state) => state.activeRole)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  useEffect(() => {
    if (!isAuthenticated || activeRole !== "Admin") return
    const socket = io(socketUrl, {
      withCredentials: true,
      auth: { activeRole },
    })
    const refreshNotifications = () => {
      void queryClient.invalidateQueries({ queryKey: ["adminNotifications"] })
    }
    socket.on("notification:new", refreshNotifications)
    return () => {
      socket.off("notification:new", refreshNotifications)
      socket.disconnect()
    }
  }, [activeRole, isAuthenticated, queryClient])
}

import { useEffect } from "react"
import { io } from "socket.io-client"
import { useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "@/store/authStore"

const socketUrl = import.meta.env.DEV ? "http://localhost:5050" : undefined

export function useMerchantRealtime() {
  const queryClient = useQueryClient()
  const activeRole = useAuthStore((state) => state.activeRole)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  useEffect(() => {
    if (!isAuthenticated || activeRole !== "Merchant") return

    const socket = io(socketUrl, {
      withCredentials: true,
      auth: { activeRole },
    })
    const refreshOrders = () => {
      void queryClient.invalidateQueries({ queryKey: ["merchantOrders"] })
      void queryClient.invalidateQueries({ queryKey: ["merchantDashboard"] })
      void queryClient.invalidateQueries({
        queryKey: ["merchantNotifications"],
      })
    }

    const orderEvents = [
      "order:new",
      "order:ready",
      "order:pickedUp",
      "order:delivered",
      "order:cancel",
      "order:rejected",
      "driver:heading-to-merchant",
      "driver:arrived-at-merchant",
    ]
    orderEvents.forEach((event) => socket.on(event, refreshOrders))

    return () => {
      orderEvents.forEach((event) => socket.off(event, refreshOrders))
      socket.disconnect()
    }
  }, [activeRole, isAuthenticated, queryClient])
}

import { useQuery } from "@tanstack/react-query"
import axios from "@/lib/axios"
import { useCartStore } from "@/store/cartStore"
import { useEffect } from "react"
import type { CartResult } from "../types/cart"
import { useAuthStore } from "@/store/authStore"

const fetchCart = async (): Promise<CartResult> => {
  const { data } = await axios.get("/cart")
  return data
}

export const useCart = () => {
  const { isAuthenticated, user } = useAuthStore()
  const { cart, itemCount, setCart, setLoading, clearCart } = useCartStore()

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["cart", user?.id],
    queryFn: fetchCart,
    enabled: isAuthenticated && Boolean(user?.id),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })

  useEffect(() => {
    if (!isAuthenticated) {
      clearCart()
      setLoading(false)
    } else if (isLoading) {
      clearCart()
      setLoading(true)
    } else if (data) {
      setCart(data.data ?? null)
      setLoading(false)
    } else {
      setLoading(false)
    }
  }, [isAuthenticated, isLoading, data, clearCart, setCart, setLoading])

  return {
    cart,
    itemCount,
    isLoading: isAuthenticated && isLoading,
    isError,
    error,
    refetch,
  }
}

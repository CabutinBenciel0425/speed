import { useQuery } from "@tanstack/react-query"
import axios from "@/lib/axios"
import { useCartStore } from "@/store/cartStore"
import { useEffect } from "react"
import type { CartResult } from "../types/cart"

const fetchCart = async (): Promise<CartResult> => {
  const { data } = await axios.get("/cart")
  return data
}

export const useCart = () => {
  const {
    cart,
    itemCount,
    setCart,
    setLoading,
    isLoading: storeLoading,
  } = useCartStore()

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["cart"],
    queryFn: fetchCart,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 10000,
  })

  useEffect(() => {
    if (data) {
      setCart(data.data)
    }
  }, [data, setCart])

  useEffect(() => {
    setLoading(isLoading)
  }, [isLoading, setLoading])

  return {
    cart,
    itemCount,
    isLoading: storeLoading,
    isError,
    error,
    refetch,
  }
}

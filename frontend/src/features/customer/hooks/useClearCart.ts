import axios from "@/lib/axios"
import type { CartResultNoData } from "../types/cart"
import { useCartStore } from "@/store/cartStore"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

export const clearCart = async (): Promise<CartResultNoData> => {
  const { data } = await axios.delete("/cart/clear-cart")
  return data
}

export const useClearCart = () => {
  const { clearCart: clearCartStore } = useCartStore()

  return useMutation({
    mutationFn: clearCart,
    onSuccess: () => {
      clearCartStore()
      toast.success("Cart successfully cleared")
    },
    onError: () => {
      toast.error("Cart cannot be cleared. Please try again")
    },
  })
}

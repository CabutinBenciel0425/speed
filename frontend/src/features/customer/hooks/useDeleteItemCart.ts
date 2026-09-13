import axios from "@/lib/axios"
import type { Cart } from "../types/cart"
import { useCartStore } from "@/store/cartStore"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

export const deleteItemCart = async (productId: string): Promise<Cart> => {
  const { data } = await axios.delete("/cart", { data: { productId } })

  return data.data
}

export const useDeleteItemCart = () => {
  const { removeItem, setCart } = useCartStore()

  return useMutation({
    mutationFn: deleteItemCart,

    onMutate: (variables) => {
      removeItem(variables)
    },
    onSuccess: (data) => {
      setCart(data)
      toast.success("Item deleted successfully")
    },
    onError: () => {
      toast.error("Something went wrong. Please try again")
    },
  })
}
